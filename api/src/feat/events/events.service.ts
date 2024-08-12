import { Injectable } from '@nestjs/common';
import { Chain } from 'chains';
import { Hex, UUID } from 'lib';
import { AbiEvent, encodeEventTopics, parseEventLogs, Log as ViemLog } from 'viem';
import { Receipt } from '../system-txs/confirmations.worker';
import { NetworksService } from '~/core/networks';

export type Log<
  TAbiEvent extends AbiEvent | undefined = undefined,
  Confirmed extends boolean = boolean,
> = ViemLog<bigint, number, Confirmed extends true ? false : true, TAbiEvent, true>;

type OptimisticListener<TAbiEvent extends AbiEvent> = (
  data: OptimisticEvent<TAbiEvent>,
) => Promise<void>;

type ConfirmedListener<TAbiEvent extends AbiEvent> = (
  data: ConfirmedEvent<TAbiEvent>,
) => Promise<void>;

export interface ProcessOptimisticParams {
  logs: Log<undefined, false>[];
  chain: Chain;
  result: UUID;
}

export interface ProcessConfirmedParams {
  logs: Log<undefined, true>[];
  chain: Chain;
  result?: UUID;
  receipt?: Receipt;
}

interface EventBase {
  chain: Chain;
  block: bigint;
  timestamp: Date;
  logIndex: number;
}

export interface OptimisticEvent<TAbiEvent extends AbiEvent> extends EventBase {
  log: Log<TAbiEvent, boolean>;
  result: UUID;
}

export interface ConfirmedEvent<TAbiEvent extends AbiEvent> extends EventBase {
  log: Log<TAbiEvent, true>;
  result: UUID | null;
  receipt?: Receipt;
}

@Injectable()
export class EventsService {
  private optimisticListeners = new Map<Hex, OptimisticListener<AbiEvent>[]>();
  private confirmedListeners = new Map<Hex, ConfirmedListener<AbiEvent>[]>();
  optimisticAbi: AbiEvent[] = [];
  confirmedAbi: AbiEvent[] = [];

  constructor(private networks: NetworksService) {}

  onOptimistic<TAbiEvent extends AbiEvent>(
    event: TAbiEvent,
    listener: OptimisticListener<TAbiEvent>,
  ) {
    const sig = encodeEventTopics({ abi: [event as AbiEvent] })[0];

    this.optimisticListeners.set(sig, [
      ...(this.optimisticListeners.get(sig) ?? []),
      listener as unknown as OptimisticListener<AbiEvent>,
    ]);
    this.optimisticAbi.push(event);
  }

  onConfirmed<TAbiEvent extends AbiEvent>(
    event: TAbiEvent,
    listener: ConfirmedListener<TAbiEvent>,
  ) {
    const sig = encodeEventTopics({ abi: [event as AbiEvent] })[0];

    this.confirmedListeners.set(sig, [
      ...(this.confirmedListeners.get(sig) ?? []),
      listener as unknown as ConfirmedListener<AbiEvent>,
    ]);
    this.confirmedAbi.push(event);
  }

  async processSimulatedAndOptimistic({ chain, logs, result }: ProcessOptimisticParams) {
    const parsedLogs = parseEventLogs({ logs, abi: this.optimisticAbi, strict: true });

    await Promise.all(
      parsedLogs
        .filter((log) => log.topics.length > 0)
        .flatMap((log, logIndex) =>
          this.optimisticListeners.get(log.topics[0]!)?.map((listener) =>
            listener({
              chain,
              block: log.blockNumber ?? 0n,
              timestamp: new Date(),
              logIndex,
              log,
              result,
            }),
          ),
        ),
    );
  }

  async processConfirmed({ chain, logs, result, receipt }: ProcessConfirmedParams) {
    const parsedLogs = parseEventLogs({ logs, abi: this.confirmedAbi, strict: true });

    const network = this.networks.get(chain);
    const blocks = await Promise.all(
      [...new Set(logs.map((log) => log.blockNumber))].map((blockNumber) =>
        network.getBlock({ blockNumber, includeTransactions: false }),
      ),
    );

    await Promise.all(
      parsedLogs
        .filter((log) => log.topics.length > 0)
        .flatMap((log) => {
          const block = blocks.find((b) => b.number === log.blockNumber)!;
          const timestamp = new Date(Number(block.timestamp) * 1000);

          return this.confirmedListeners.get(log.topics[0]!)?.map((listener) =>
            listener({
              chain,
              block: log.blockNumber,
              timestamp,
              logIndex: log.logIndex,
              log,
              result: result ?? null,
              receipt,
            }),
          );
        }),
    );
  }
}
