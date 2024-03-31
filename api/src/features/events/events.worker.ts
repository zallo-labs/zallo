import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { NetworksService } from '../util/networks/networks.service';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { Hex, asHex } from 'lib';
import { CHAINS, Chain } from 'chains';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
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
import { runOnce } from '~/util/mutex';
import { UnrecoverableError } from 'bullmq';

const TARGET_LOGS_PER_JOB = 9_000; // Max 10k
const DEFAULT_LOGS_PER_BLOCK = 200;
const LPB_ALPHA = 0.2;
const MAX_DELAY = 30_000; // ms
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

export type Log<TAbiEvent extends AbiEvent | undefined = undefined> = ViemLog<
  bigint,
  number,
  false,
  TAbiEvent,
  true
>;

export interface EventData<TAbiEvent extends AbiEvent> {
  chain: Chain;
  log: Log<TAbiEvent>;
}

export type EventListener<TAbiEvent extends AbiEvent> = (
  data: EventData<TAbiEvent>,
) => Promise<void>;

@Injectable()
@Processor(EventsQueue.name)
export class EventsWorker extends Worker<EventsQueue> {
  private listeners = new Map<Hex, EventListener<AbiEvent>[]>();
  private events: AbiEvent[] = [];
  private logsPerBlock = Object.fromEntries(
    Object.keys(CHAINS).map((chain) => [chain as Chain, undefined]),
  ) as Record<Chain, number | undefined>;

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

  on<TAbiEvent extends AbiEvent>(event: TAbiEvent, listener: EventListener<TAbiEvent>) {
    const topic = encodeEventTopics({ abi: [event as AbiEvent] })[0];
    this.listeners.set(topic, [
      ...(this.listeners.get(topic) ?? []),
      listener as unknown as EventListener<AbiEvent>,
    ]);
    this.events.push(event);
  }

  async process(job: TypedJob<EventsQueue>) {
    const { chain, from } = job.data;
    const network = this.networks.get(chain);
    const latest = Number(network.blockNumber()); // Warning: bigint -> number
    const to = Math.min(job.data.to ?? from + this.targetBlocks(chain) - 1, latest);

    // Queue next job on the first attempt unless split job
    const shouldQueue = job.attemptsMade === 0 && !job.data.split;
    if (shouldQueue) {
      if (latest < from) {
        this.queue.add(
          'Ahead',
          { chain, from },
          { delay: Math.min(network.blockTime(), MAX_DELAY) },
        );
      } else {
        this.queue.add(
          latest === from ? 'Tracking' : 'Behind',
          { chain, from: to + 1 },
          { delay: latest === from ? Math.min(network.blockTime(), MAX_DELAY) : undefined },
        );
      }
    }

    if (to < from) return;

    try {
      const logs = await network.getLogs({
        fromBlock: BigInt(from),
        toBlock: BigInt(to),
        events: this.events,
        strict: true,
      });

      const blocksProcessed = to - from + 1;
      this.updateLogsPerBlock(chain, logs.length, blocksProcessed);

      await Promise.all(
        logs
          .filter((log) => log.topics.length)
          .flatMap((log) =>
            this.listeners.get(log.topics[0]!)?.map((listener) => listener({ chain, log })),
          ),
      );
      this.log.verbose(
        `${chain}: ${logs.length} events from ${blocksProcessed} blocks [${from}, ${to}]`,
      );
    } catch (e) {
      const match = TOO_MANY_RESULTS_RE.exec((e as Error).message ?? '');
      if (!match) throw e;

      // Split the job into two smaller jobs
      const mid = hexToNumber(asHex(match[1]));
      if (to < mid || (typeof mid !== 'number' && !isNaN(mid)))
        throw new UnrecoverableError(`Invalid split block range: [${from}), ${mid}] for split`);

      this.queue.addBulk([
        { name: 'Split (lower)', data: { chain, from, to: mid, split: true } },
        { name: 'Split (upper)', data: { chain, from: mid + 1, to, split: true } },
      ]);
    }
  }

  targetBlocks(chain: Chain) {
    const logsPerBlock = this.logsPerBlock[chain] ?? DEFAULT_LOGS_PER_BLOCK;
    return Math.max(1, Math.floor(TARGET_LOGS_PER_JOB / logsPerBlock));
  }

  updateLogsPerBlock(chain: Chain, logs: number, blocks: number) {
    const lpb = this.logsPerBlock[chain];
    this.logsPerBlock[chain] = lpb
      ? (1 - LPB_ALPHA) * lpb + LPB_ALPHA * (logs / blocks)
      : logs / blocks;
  }

  private async addMissingJob() {
    await runOnce(
      async () => {
        const runningJobs = await this.queue.getJobs(RUNNING_JOB_STATUSES);

        for await (const network of this.networks) {
          if (runningJobs.find((j) => j.data.chain === network.chain.key)) continue;

          const lastProcessedBlock = (await e
            .max(
              e.select(e.Transfer, (t) => ({
                filter: e.op(t.account.chain, '=', network.chain.key),
                block: true,
              })).block,
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
      },
      {
        redis: this.redis,
        key: 'events-missing-job',
      },
    );
  }
}
