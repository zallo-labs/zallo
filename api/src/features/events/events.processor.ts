import { BullModuleOptions, InjectQueue, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { ProviderService } from '../util/provider/provider.service';
import _ from 'lodash';
import { Log } from '@ethersproject/abstract-provider';
import { BigNumber } from 'ethers';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';

const DEFAULT_CHUNK_SIZE = 75;
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
  queueNext?: boolean;
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
  ) {}

  onModuleInit() {
    this.addMissingJob();
  }

  on(topic: string, listener: EventListener) {
    this.listeners.set(topic, [...(this.listeners.get(topic) ?? []), listener]);
    this.topics.push(topic);
  }

  @Process()
  async process(job: Job<EventJobData>) {
    const latest = await this.provider.getBlockNumber();
    const from = job.data.from;
    const to = Math.min(job.data.to ?? from + DEFAULT_CHUNK_SIZE - 1, latest);

    // Only queue next jobs on the first attempt to prevent retried jobs creating duplicates
    if (job.attemptsMade === 0 && job.data.queueNext !== false) {
      if (latest < from) {
        // Up to date; try again after a delay
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
        toBlock: Math.min(to, latest),
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
      logs.flatMap((log) =>
        this.listeners.get(log.topics[0])?.map((listener) => listener({ log })),
      ),
    );
    Logger.verbose(`Processed ${logs.length} events from ${to - from + 1} blocks [${from}, ${to}]`);
  }

  @OnQueueFailed()
  onFailed(job: Job<EventJobData>, error: unknown) {
    Logger.error('Events queue job failed', { job, error });
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

    this.queue.add({
      from: lastProcessedBlock
        ? parseInt(lastProcessedBlock.toString()) // Warning: bigint -> number
        : await this.provider.getBlockNumber(),
    });
  }
}
