import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  ACCOUNT_IMPLEMENTATION,
  asChain,
  asDecimal,
  asHex,
  asUAddress,
  Hex,
  isTruthy,
  tryOrCatch,
} from 'lib';
import { TransactionData, TransactionEventData, TransactionsWorker } from './transactions.worker';
import { InjectQueue } from '@nestjs/bullmq';
import { TRANSACTIONS_QUEUE } from './transactions.queue';
import e from '~/edgeql-js';
import { DatabaseService } from '../database/database.service';
import { and } from '../database/database.util';
import { NetworksService } from '../util/networks/networks.service';
import { decodeEventLog, getAbiItem } from 'viem';
import { ProposalsService } from '../proposals/proposals.service';
import { ProposalEvent } from '../proposals/proposals.input';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { Mutex } from 'redis-semaphore';
import { RUNNING_JOB_STATUSES, TypedQueue } from '../util/bull/bull.util';
import { ETH } from 'lib/dapps';

@Injectable()
export class TransactionsEvents implements OnModuleInit {
  constructor(
    @InjectQueue(TRANSACTIONS_QUEUE.name)
    private queue: TypedQueue<typeof TRANSACTIONS_QUEUE>,
    private db: DatabaseService,
    @InjectRedis() private redis: Redis,
    private networks: NetworksService,
    private transactionsProcessor: TransactionsWorker,
    private proposals: ProposalsService,
  ) {
    this.transactionsProcessor.onEvent(
      getAbiItem({ abi: ACCOUNT_IMPLEMENTATION.abi, name: 'OperationExecuted' }),
      (data) => this.executed(data),
    );
    this.transactionsProcessor.onEvent(
      getAbiItem({ abi: ACCOUNT_IMPLEMENTATION.abi, name: 'OperationsExecuted' }),
      (data) => this.executed(data),
    );
    this.transactionsProcessor.onTransaction((data) => this.reverted(data));
  }

  async onModuleInit() {
    const mutex = new Mutex(this.redis, 'transactions-missing-jobs', { lockTimeout: 60_000 });
    try {
      if (await mutex.tryAcquire()) await this.addMissingJobs();
    } finally {
      await mutex.release();
    }
  }

  private async executed({ chain, log, receipt, block }: TransactionEventData) {
    const r = tryOrCatch(
      () =>
        decodeEventLog({
          abi: ACCOUNT_IMPLEMENTATION.abi,
          topics: log.topics as [Hex, ...Hex[]],
          data: log.data as Hex,
        }),
      (e) => {
        Logger.warn(`Failed to decode executed event log: ${e}`);
      },
    );
    if (r?.eventName !== 'OperationExecuted' && r?.eventName !== 'OperationsExecuted') return;

    const proposalHash = asHex(r.args.proposal);

    await this.db.query(
      e.update(e.Transaction, () => ({
        filter_single: { hash: asHex(receipt.transactionHash) },
        set: {
          receipt: e.insert(e.Receipt, {
            success: true,
            responses: 'responses' in r.args ? [...r.args.responses] : [r.args.response],
            gasUsed: receipt.gasUsed,
            ethFeePerGas: asDecimal(receipt.effectiveGasPrice, ETH).toString(),
            block: BigInt(receipt.blockNumber),
            timestamp: new Date(Number(block.timestamp) * 1000), // block.timestamp is in seconds
          }),
        },
      })),
    );

    Logger.debug(`Proposal executed: ${proposalHash}`);

    await this.proposals.publishProposal(
      { account: asUAddress(log.address, chain), hash: proposalHash },
      ProposalEvent.executed,
    );
  }

  private async reverted({ chain, receipt, block }: TransactionData) {
    if (receipt.status !== 'reverted') return;

    const network = this.networks.get(chain);
    const tx = await network.getTransaction({ hash: receipt.transactionHash });
    const callResponse = await network.call(tx);

    const transaction = e.update(e.Transaction, () => ({
      filter_single: { hash: receipt.transactionHash },
      set: {
        receipt: e.insert(e.Receipt, {
          success: false,
          responses: [callResponse.data].filter(isTruthy),
          gasUsed: receipt.gasUsed,
          ethFeePerGas: asDecimal(receipt.effectiveGasPrice, ETH).toString(),
          block: receipt.blockNumber,
          timestamp: new Date(Number(block.timestamp) * 1000), // block.timestamp is in seconds
        }),
      },
    }));

    const proposalHash = await this.db.query(
      e.select(transaction, () => ({ proposal: { hash: true } })).proposal.hash,
    );
    if (!proposalHash)
      throw new Error(`Proposal not found for reverted transaction: ${receipt.transactionHash}`);

    Logger.debug(`Proposal reverted: ${proposalHash}`);

    await this.proposals.publishProposal(
      { account: asUAddress(receipt.from, chain), hash: asHex(proposalHash) },
      ProposalEvent.executed,
    );
  }

  private async addMissingJobs() {
    const jobs = await this.queue.getJobs(RUNNING_JOB_STATUSES);

    const orphanedTransactions = await this.db.query(
      e.select(e.Transaction, (t) => ({
        filter: and(
          e.op('not', e.op('exists', t.receipt)),
          jobs.length
            ? e.op(t.hash, 'not in', e.set(...jobs.map((job) => job.data.transaction)))
            : undefined,
        ),
        hash: true,
        proposal: {
          account: { address: true },
        },
      })),
    );

    if (orphanedTransactions.length) {
      await this.queue.addBulk(
        orphanedTransactions.map((t) => ({
          name: TRANSACTIONS_QUEUE.name,
          data: {
            chain: asChain(asUAddress(t.proposal.account.address)),
            transaction: asHex(t.hash),
          },
        })),
      );
    }
  }
}
