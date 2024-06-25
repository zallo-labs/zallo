import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { NetworksService } from '~/core/networks/networks.service';
import { DatabaseService } from '~/core/database';
import e from '~/edgeql-js';
import { Hex, asHex } from 'lib';
import { CHAINS, Chain } from 'chains';
import { RUNNING_JOB_STATUSES, TypedJob, createQueue } from '~/core/bull/bull.util';
import { Worker } from '~/core/bull/Worker';
import { AbiEvent } from 'abitype';
import { Log as ViemLog, encodeEventTopics, hexToNumber } from 'viem';
import { JobsOptions, UnrecoverableError } from 'bullmq';

const TARGET_LOGS_PER_JOB = 9_000; // Max 10k
const DEFAULT_LOGS_PER_BLOCK = 200;
const LPB_ALPHA = 0.2;

const TOO_MANY_RESULTS_RE = /Try with this block range \[(?:0x[0-9a-f]+), (0x[0-9a-f]+)\]/; // zkSync
const TOO_MANY_BLOCKS_RE = /limited to (\d+) block range/; // blockpi

export const EventsQueue = createQueue<EventJobData>('Events');
export type EventsQueue = typeof EventsQueue;

interface EventJobData {
  chain: Chain;
  from: number;
  to: number;
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
@Processor(EventsQueue.name, { autorun: false })
export class EventsWorker extends Worker<EventsQueue> {
  private listeners = new Map<Hex, EventListener<AbiEvent>[]>();
  private events: AbiEvent[] = [];
  private logsPerBlock = Object.fromEntries(
    Object.keys(CHAINS).map((chain) => [chain as Chain, undefined]),
  ) as Record<Chain, number | undefined>;

  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
  ) {
    super();
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
    const latest = Number(await network.blockNumber()); // Warning: bigint -> number

    if (latest < from) {
      // Add a non-unique job
      this.queue.add(
        'Ahead',
        { chain, from, to: job.data.to },
        { delay: delay(network.blockTime()) },
      );
      return;
    }

    // Only process up to latest block
    const firstAttempt = job.attemptsMade === 0 && !job.data.split;
    const to = firstAttempt ? Math.min(job.data.to, latest) : job.data.to;
    if (to !== job.data.to) await job.updateData({ ...job.data, to }); // Ensures deterministic retries

    // Queue following job
    if (firstAttempt) {
      if (to < latest) {
        this.addUnique('Behind', { chain, from: to + 1, to: to + this.targetBlocks(chain) });
      } else {
        this.addUnique(
          'Tracking',
          { chain, from: to + 1, to: to + this.targetBlocks(chain) },
          { delay: delay(network.blockTime()) },
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
      const message = (e as Error).message;

      let match = TOO_MANY_RESULTS_RE.exec(message);
      if (match) {
        const mid = Math.max(from, hexToNumber(asHex(match[1])));
        if (to <= mid)
          throw new UnrecoverableError(`Invalid split block range: [${from}, ${mid}] for split`);

        this.queue.addBulk(
          [
            { chain, from, to: mid, split: true },
            { chain, from: mid + 1, to, split: true },
          ].map((data) => ({
            name: 'Split (too many results)',
            data,
            opts: { jobId: uniqueId(data) },
          })),
        );

        return;
      }

      match = TOO_MANY_BLOCKS_RE.exec(message);
      if (match) {
        const maxRange = parseInt(match[1]);

        this.queue.addBulk(
          partitionRange(from, to, maxRange).map(([from, to]) => {
            const data = { chain, from, to, split: true };
            return {
              name: 'Split (range limited)',
              data,
              opts: { jobId: uniqueId(data) },
            };
          }),
        );
        return;
      }
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

  async bootstrap() {
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
        : Number(await network.blockNumber()); // Warning: bigint -> number

      const chain = network.chain.key;
      this.addUnique('Bootstrap', { chain, from, to: from + this.targetBlocks(chain) });

      this.log.log(
        `${network.chain.key}: events starting from ${
          lastProcessedBlock ? `last processed (${from})` : `latest (${from})`
        }`,
      );
    }
  }

  private addUnique(name: string, data: EventJobData, opts?: JobsOptions) {
    return this.queue.add(name, data, { jobId: uniqueId(data), ...opts });
  }
}

function delay(blockTime: number) {
  return Math.max(50 /* min */, Math.min(blockTime - 100, 30_000 /* max */));
}

function partitionRange(rangeFrom: number, rangeTo: number, n: number) {
  const chunks: [number, number][] = [];
  for (let from = rangeFrom; from <= rangeTo; from += n) {
    chunks.push([from, Math.min(from + n - 1, rangeTo)]);
  }
  return chunks;
}

function uniqueId(d: EventJobData) {
  return `${d.chain}:[${d.from}-${d.to}]` + (d.split ? ':split' : '');
}
