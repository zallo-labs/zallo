import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NetworksService } from '../util/networks/networks.service';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { P, match } from 'ts-pattern';
import { Hex, asHex, tryOrCatchAsync } from 'lib';
import { Chain } from 'chains';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { Mutex } from 'redis-semaphore';
import {
  RUNNING_JOB_STATUSES,
  TypedJob,
  TypedQueue,
  TypedWorker,
  createQueue,
} from '../util/bull/bull.util';
import { AbiEvent } from 'abitype';
import { Log as ViemLog, encodeEventTopics, hexToNumber } from 'viem';

const DEFAULT_CHUNK_SIZE = 200;
const BLOCK_TIME_MS = 500;
const TOO_MANY_RESULTS_RE =
  /Query returned more than .+? results. Try with this block range \[(?:0x[0-9a-f]+), (0x[0-9a-f]+)\]/;

export const EventsQueue = createQueue<EventJobData>('Events', {
  defaultJobOptions: {
    attempts: 50,
    backoff: {
      type: 'fixed',
      delay: BLOCK_TIME_MS,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
export type EventsQueue = typeof EventsQueue;

interface EventJobData {
  chain: Chain;
  from: number;
  to?: number;
  queueNext?: false | number;
}

export type Log = ViemLog<bigint, number, false, undefined, true, AbiEvent[], undefined>;

export interface EventData {
  chain: Chain;
  log: Log;
}

export type EventListener = (data: EventData) => Promise<void>;

@Injectable()
@Processor(EventsQueue.name)
export class EventsWorker extends WorkerHost<TypedWorker<EventsQueue>> implements OnModuleInit {
  private listeners = new Map<Hex, EventListener[]>();
  private events: AbiEvent[] = [];

  constructor(
    @InjectQueue(EventsQueue.name)
    private queue: TypedQueue<EventsQueue>,
    private db: DatabaseService,
    private networks: NetworksService,
    @InjectRedis() private redis: Redis,
  ) {
    super();
  }

  async onModuleInit() {
    const mutex = new Mutex(this.redis, 'events-missing-job', { lockTimeout: 60_000 });
    try {
      if (await mutex.tryAcquire()) await this.addMissingJob();
    } finally {
      await mutex.release();
    }
  }

  on(event: AbiEvent, listener: EventListener) {
    const topic = encodeEventTopics({ abi: [event] })[0];
    this.listeners.set(topic, [...(this.listeners.get(topic) ?? []), listener]);
    this.events.push(event);
  }

  async process(job: TypedJob<EventsQueue>) {
    const { chain } = job.data;
    const network = this.networks.get(chain);

    const latest = await tryOrCatchAsync(
      async () => Number(await network.getBlockNumber()), // Warning: truncate bigint -> number
      async (e) => {
        if (job.data.queueNext !== false) {
          // Next job hasn't been queued yet, queue it next attempt
          await job.updateData({ ...job.data, queueNext: job.attemptsMade + 1 });
        }
        throw e;
      },
    );
    const from = job.data.from;
    const to = Math.min(job.data.to ?? from + DEFAULT_CHUNK_SIZE - 1, latest);

    const shouldQueue = match(job.data.queueNext)
      .with(undefined, () => job.attemptsMade === 1) // First job - default path
      .with(false, () => false) // Split job - don't queue next
      .with(P.number, (n) => job.attemptsMade === n) // Prior attempt had failed before queueing - queue only if not already queued
      .exhaustive();

    if (shouldQueue) {
      if (latest < from) {
        // Up to date; retry after a delay
        return this.queue.add(EventsQueue.name, { chain, from }, { delay: BLOCK_TIME_MS });
      } else {
        // Queue up next job
        this.queue.add(
          EventsQueue.name,
          { chain, from: to + 1 },
          { delay: latest === from ? BLOCK_TIME_MS : undefined },
        );
      }
    }

    let logs: Log[];
    try {
      logs = await network.getLogs({
        fromBlock: BigInt(from),
        toBlock: BigInt(to),
        events: this.events,
        strict: true,
      });
    } catch (e) {
      const match = TOO_MANY_RESULTS_RE.exec((e as Error).message ?? '');
      if (match) {
        // Split the job into two smaller jobs
        const newTo = hexToNumber(asHex(match[1]));
        return this.queue.addBulk([
          { name: EventsQueue.name, data: { chain, from, to: newTo, queueNext: false } },
          { name: EventsQueue.name, data: { chain, from: newTo + 1, to, queueNext: false } },
        ]);
      }

      throw e;
    }

    await Promise.all(
      logs
        .filter((log) => log.topics.length)
        .flatMap(
          (log) => this.listeners.get(log.topics[0]!)?.map((listener) => listener({ chain, log })),
        ),
    );
    Logger.verbose(`Processed ${logs.length} events from ${to - from + 1} blocks [${from}, ${to}]`);
  }

  private async addMissingJob() {
    const runningJobs = await this.queue.getJobs(RUNNING_JOB_STATUSES);

    for await (const network of this.networks) {
      if (runningJobs.find((j) => j.data.chain === network.chain.key)) continue;

      const lastProcessedBlock = (await e
        .max(
          e.op(
            e.select(e.Receipt, (r) => ({
              filter: e.op(r.transaction.proposal.account.chain, '=', network.chain.key),
              block: true,
            })).block,
            'union',
            e.select(e.Transfer, (t) => ({
              filter: e.op(t.account.chain, '=', network.chain.key),
              block: true,
            })).block,
          ),
        )
        .run(this.db.client)) as bigint | null; // Return type is overly broad - https://github.com/edgedb/edgedb-js/issues/594

      const from = lastProcessedBlock
        ? Number(lastProcessedBlock) + 1 // Warning: bigint -> number
        : Number(await network.getBlockNumber()); // Warning: bigint -> number
      Logger.log(`${network.chain.key}: events starting from block ${from}`);

      this.queue.add(EventsQueue.name, { chain: network.chain.key, from });
    }
  }
}
