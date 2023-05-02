import {
  BullModuleOptions,
  InjectQueue,
  OnQueueFailed,
  Process,
  Processor as EventListener,
  OnQueueCompleted,
} from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProviderService } from '../util/provider/provider.service';
import _ from 'lodash';
import { Log } from '@ethersproject/abstract-provider';
import { BigNumber } from 'ethers';

const DEFAULT_CHUNK_SIZE = 100;
const BLOCK_TIME_MS = 500;
const BLOCKS_DELAYED_MS = 2500;
const BLOCK_RANGE_PATTERN =
  /'Query returned more than 10000 results. Try with this block range \[(?:0x[0-9a-f]+), (0x[0-9a-f]+)\]/;

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

interface Event {
  from: number;
  to?: number;
}

export interface EventData {
  log: Log;
}

export type EventListener = (data: EventData) => Promise<void>;

@Injectable()
@EventListener(EVENTS_QUEUE.name)
export class EventsProcessor implements OnModuleInit {
  private listeners = new Map<string, EventListener[]>();
  private topics: string[] = [];
  private complete = new Set<number | string>();

  constructor(
    @InjectQueue(EVENTS_QUEUE.name)
    private queue: Queue<Event>,
    private provider: ProviderService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.addMissingJob();
  }

  on(topic: string, listener: EventListener) {
    this.listeners.set(topic, [...(this.listeners.get(topic) ?? []), listener]);
    this.topics.push(topic);
  }

  @Process()
  async process(job: Job<Event>) {
    if (this.complete.has(job.id)) console.warn('Found complete job', job.data);

    const latest = await this.provider.getBlockNumber();
    const from = job.data.from;
    if (latest < from) {
      this.queue.add({ from }, { delay: BLOCKS_DELAYED_MS });
      return;
    }

    const to = Math.min(job.data.to ?? from + DEFAULT_CHUNK_SIZE - 1, latest);
    const behind = latest > to;
    if (behind) this.queue.add({ from: to + 1 });

    let logs: Log[];
    try {
      logs = await this.provider.getLogs({
        fromBlock: from,
        toBlock: Math.min(to, latest),
        topics: [this.topics],
      });
    } catch (e) {
      const match = BLOCK_RANGE_PATTERN.exec((e as Error).message ?? '');
      if (match) {
        const newTo = BigNumber.from(match[1]).toNumber();
        this.queue.addBulk([{ data: { from, to: newTo } }, { data: { from: newTo + 1, to } }]);
        Logger.verbose(`Split ${from}-${newTo}-${to}`);
        return;
      }

      throw e;
    }

    await Promise.all(
      logs.flatMap((log) =>
        this.listeners.get(log.topics[0])?.map((listener) => listener({ log })),
      ),
    );
    Logger.verbose(`Processed ${logs.length} events from ${to - from + 1} blocks [${from}, ${to}]`);

    if (!behind) this.queue.add({ from: to + 1 }, { delay: BLOCK_TIME_MS });
  }

  @OnQueueFailed()
  onFailed(job: Job<Event>, error: unknown) {
    Logger.error('Events queue job failed', { job, error });
  }

  @OnQueueCompleted()
  onComplete(job: Job<Event>) {
    this.complete.add(job.id);
  }

  private async addMissingJob() {
    const existingJobs = await this.queue.getJobs(['waiting', 'active', 'delayed']);
    Logger.verbose(`Starting with ${existingJobs.length} existing event jobs`);
    if (existingJobs.length) return;

    const [lastTxBlock, lastTransferBlock] = await Promise.all([
      this.prisma.asSystem.transactionReceipt.aggregate({ _max: { blockNumber: true } }),
      this.prisma.asSystem.transfer.aggregate({ _max: { blockNumber: true } }),
    ]);

    this.queue.add({
      from:
        lastTxBlock._max.blockNumber || lastTransferBlock._max.blockNumber
          ? Math.max(lastTxBlock._max.blockNumber ?? 0, lastTransferBlock._max.blockNumber ?? 0)
          : await this.provider.getBlockNumber(), // Start from latest block
    });
  }
}
