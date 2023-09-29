import { BullModuleOptions, InjectQueue, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { ProviderService } from '../util/provider/provider.service';
import _ from 'lodash';
import { Log } from '@ethersproject/abstract-provider';
import { BigNumber } from 'ethers';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { P, match } from 'ts-pattern';
import { tryOrCatchAsync } from 'lib';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { Mutex } from 'redis-semaphore';

const DEFAULT_CHUNK_SIZE = 200;
const BLOCK_TIME_MS = 500;
const BLOCKS_DELAYED_MS = 2500;
const TOO_MANY_RESULTS_PATTERN =
  /Query returned more than 10000 results. Try with this block range \[(?:0x[0-9a-f]+), (0x[0-9a-f]+)\]/;

export const EVENTS_QUEUE = {
  name: 'Events',
  defaultJobOptions: {
    attempts: 50,
    backoff: {
      type: 'fixed',
      delay: BLOCK_TIME_MS,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
} satisfies BullModuleOptions;

export interface EventJobData {
  from: number;
  to?: number;
  queueNext?: false | number;
}

export interface EventData {
  log: Log;
}

export type EventListener = (data: EventData) => Promise<void>;

@Injectable()
@Processor(EVENTS_QUEUE.name)
export class EventsProcessor implements OnModuleInit {
  private listeners = new Map<string, EventListener[]>();
  private topics: string[] = [];

  constructor(
    @InjectQueue(EVENTS_QUEUE.name)
    private queue: Queue<EventJobData>,
    private provider: ProviderService,
    private db: DatabaseService,
    @InjectRedis() private redis: Redis,
  ) {}

  async onModuleInit() {
    const mutex = new Mutex(this.redis, 'events-missing-job');
    try {
      if (await mutex.tryAcquire()) await this.addMissingJob();
    } finally {
      await mutex.release();
    }
  }

  on(topic: string, listener: EventListener) {
    this.listeners.set(topic, [...(this.listeners.get(topic) ?? []), listener]);
    this.topics.push(topic);
  }

  @Process()
  async process(job: Job<EventJobData>) {
    const latest = await tryOrCatchAsync(
      () => this.provider.getBlockNumber(),
      async (e) => {
        if (job.data.queueNext !== false) {
          // Next job hasn't been queued yet, queue it next attempt
          await job.update({ ...job.data, queueNext: job.attemptsMade + 1 });
        }
        throw e;
      },
    );
    const from = job.data.from;
    const to = Math.min(job.data.to ?? from + DEFAULT_CHUNK_SIZE - 1, latest);

    const shouldQueue = match(job.data.queueNext)
      .with(undefined, () => job.attemptsMade === 0) // First job - default path
      .with(false, () => false) // Split job - don't queue next
      .with(P.number, (n) => job.attemptsMade === n) // Prior attempt had failed before queueing - queue only if not already queued
      .exhaustive();

    if (shouldQueue) {
      if (latest < from) {
        // Up to date; retry after a delay
        return this.queue.add({ from }, { delay: BLOCKS_DELAYED_MS });
      } else {
        // Queue up next job
        this.queue.add({ from: to + 1 }, { delay: latest === from ? BLOCK_TIME_MS : undefined });
      }
    }

    let logs: Log[];
    try {
      logs = await this.provider.getLogs({
        fromBlock: from,
        toBlock: to,
        topics: [this.topics],
      });
    } catch (e) {
      const match = TOO_MANY_RESULTS_PATTERN.exec((e as Error).message ?? '');
      if (match) {
        // Split the job into two smaller jobs
        const newTo = BigNumber.from(match[1]).toNumber();
        return this.queue.addBulk([
          { data: { from, to: newTo, queueNext: false } },
          { data: { from: newTo + 1, to, queueNext: false } },
        ]);
      }

      throw e;
    }

    await Promise.all(
      logs.flatMap(
        (log) => this.listeners.get(log.topics[0])?.map((listener) => listener({ log })),
      ),
    );
    Logger.verbose(`Processed ${logs.length} events from ${to - from + 1} blocks [${from}, ${to}]`);
  }

  @OnQueueFailed()
  onFailed(job: Job<EventJobData>, error: unknown) {
    if (!job.opts.attempts || job.attemptsMade === job.opts.attempts)
      Logger.error('Events queue job failed', { job: job.data, error });
  }

  private async addMissingJob() {
    const nExistingJobs = await this.queue.getJobCountByTypes(['waiting', 'active', 'delayed']);
    Logger.log(`Events starting with jobs: ${nExistingJobs}`);
    if (nExistingJobs) return;

    const lastProcessedBlock = (await e
      .max(
        e.op(
          e.select(e.Receipt, () => ({ block: true })).block,
          'union',
          e.select(e.Transfer, () => ({ block: true })).block,
        ),
      )
      .run(this.db.client)) as bigint | null; // Return type is overly broad - https://github.com/edgedb/edgedb-js/issues/594

    const from = lastProcessedBlock
      ? parseInt(lastProcessedBlock.toString()) + 1 // Warning: bigint -> number
      : await this.provider.getBlockNumber();
    Logger.log(`Events starting from block ${from}`);

    this.queue.add({ from });
  }
}
