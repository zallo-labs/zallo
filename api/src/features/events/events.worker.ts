import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { NetworksService } from '../util/networks/networks.service';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { Hex, asHex } from 'lib';
import { Chain } from 'chains';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { Mutex } from 'redis-semaphore';
import {
  RUNNING_JOB_STATUSES,
  Worker,
  TypedJob,
  createQueue,
  TypedQueue,
} from '../util/bull/bull.util';
import { DEFAULT_JOB_OPTIONS } from '../util/bull/bull.module';
import { AbiEvent } from 'abitype';
import { Log as ViemLog, encodeEventTopics, hexToNumber } from 'viem';

const DEFAULT_CHUNK_SIZE = 200;
const BLOCK_TIME = 500; /* ms */
const TOO_MANY_RESULTS_RE =
  /Query returned more than .+? results. Try with this block range \[(?:0x[0-9a-f]+), (0x[0-9a-f]+)\]/;

export const EventsQueue = createQueue<EventJobData>('Events', {
  defaultJobOptions: {
    ...DEFAULT_JOB_OPTIONS,
    // LIFO ensures that the oldest blocks are processed first, without the overhead of prioritized jobs
    // This is due to the next block being added prior to (potential) block splits
    lifo: true,
  },
});
export type EventsQueue = typeof EventsQueue;

interface EventJobData {
  chain: Chain;
  from: number;
  to?: number;
  split?: boolean;
}

export type Log = ViemLog<bigint, number, false, undefined, true, AbiEvent[], undefined>;

export interface EventData {
  chain: Chain;
  log: Log;
}

export type EventListener = (data: EventData) => Promise<void>;

@Injectable()
@Processor(EventsQueue.name)
export class EventsWorker extends Worker<EventsQueue> {
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

  onModuleInit() {
    super.onModuleInit();
    this.addMissingJob();
  }

  on(event: AbiEvent, listener: EventListener) {
    const topic = encodeEventTopics({ abi: [event] })[0];
    this.listeners.set(topic, [...(this.listeners.get(topic) ?? []), listener]);
    this.events.push(event);
  }

  async process(job: TypedJob<EventsQueue>) {
    const { chain } = job.data;
    const network = this.networks.get(chain);

    const latest = Number(network.blockNumber()); // Warning: bigint -> number
    const from = job.data.from;
    const to = Math.min(job.data.to ?? from + DEFAULT_CHUNK_SIZE - 1, latest);

    // Queue next job on the first attempt unless split job
    const shouldQueue = job.attemptsMade === 1 && !job.data.split;

    if (shouldQueue) {
      if (latest < from) {
        // Up to date; retry after a delay
        return this.queue.add(EventsQueue.name, { chain, from }, { delay: BLOCK_TIME * 2 });
      } else {
        // Queue up next job
        this.queue.add(
          EventsQueue.name,
          { chain, from: to + 1 },
          { delay: latest === from ? BLOCK_TIME : undefined },
        );
      }
    }

    try {
      const logs = await network.getLogs({
        fromBlock: BigInt(from),
        toBlock: BigInt(to),
        events: this.events,
        strict: true,
      });

      await Promise.all(
        logs
          .filter((log) => log.topics.length)
          .flatMap(
            (log) =>
              this.listeners.get(log.topics[0]!)?.map((listener) => listener({ chain, log })),
          ),
      );
      this.log.verbose(
        `Processed ${logs.length} events from ${to - from + 1} blocks [${from}, ${to}] on ${chain}`,
      );
    } catch (e) {
      const match = TOO_MANY_RESULTS_RE.exec((e as Error).message ?? '');
      if (!match) throw e;

      // Split the job into two smaller jobs
      const newTo = hexToNumber(asHex(match[1]));
      this.log.log(
        `Splitting job [${from}, ${to}] by ${to - newTo}` +
          (job.data.split ? ' -- already split' : '') +
          `on ${chain}`,
      );
      return this.queue.addBulk([
        { name: EventsQueue.name, data: { chain, from, to: newTo, split: true } },
        { name: EventsQueue.name, data: { chain, from: newTo + 1, to, split: true } },
      ]);
    }
  }

  private async addMissingJob() {
    const mutex = new Mutex(this.redis, 'events-missing-job', { lockTimeout: 60_000 });
    try {
      if (!(await mutex.tryAcquire())) return;

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
          : Number(network.blockNumber()); // Warning: bigint -> number

        this.queue.add(EventsQueue.name, { chain: network.chain.key, from });

        this.log.log(
          `${network.chain.key}: events starting from ${
            lastProcessedBlock ? `last processed (${from})` : `latest (${from})`
          }`,
        );
      }
    } finally {
      mutex.release();
    }
  }
}
