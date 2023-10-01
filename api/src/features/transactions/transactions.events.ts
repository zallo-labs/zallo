import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ACCOUNT_ABI, asAddress, asHex, Hex, tryOrCatch } from 'lib';
import {
  TransactionData,
  TransactionEventData,
  TransactionsProcessor,
} from './transactions.processor';
import { InjectQueue } from '@nestjs/bull';
import { TRANSACTIONS_QUEUE, TransactionEvent } from './transactions.queue';
import { Queue } from 'bull';
import e from '~/edgeql-js';
import { DatabaseService } from '../database/database.service';
import { and } from '../database/database.util';
import { ProviderService } from '../util/provider/provider.service';
import { EIP712_TX_TYPE } from 'zksync-web3/build/src/utils';
import { decodeEventLog, getAbiItem, getEventSelector } from 'viem';
import { ProposalsService } from '../proposals/proposals.service';
import { ProposalEvent } from '../proposals/proposals.input';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { Mutex } from 'redis-semaphore';
import { RUNNING_JOB_STATUSES } from '../util/bull/bull.util';

@Injectable()
export class TransactionsEvents implements OnModuleInit {
  constructor(
    @InjectQueue(TRANSACTIONS_QUEUE.name)
    private queue: Queue<TransactionEvent>,
    private db: DatabaseService,
    @InjectRedis() private redis: Redis,
    private provider: ProviderService,
    private transactionsProcessor: TransactionsProcessor,
    private proposals: ProposalsService,
  ) {
    this.transactionsProcessor.onEvent(
      getEventSelector(getAbiItem({ abi: ACCOUNT_ABI, name: 'OperationExecuted' })),
      (data) => this.executed(data),
    );
    this.transactionsProcessor.onEvent(
      getEventSelector(getAbiItem({ abi: ACCOUNT_ABI, name: 'OperationsExecuted' })),
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

  private async executed({ log, receipt, block }: TransactionEventData) {
    const r = tryOrCatch(
      () =>
        decodeEventLog({
          abi: ACCOUNT_ABI,
          topics: log.topics as [Hex, ...Hex[]],
          data: log.data as Hex,
        }),
      (e) => {
        Logger.warn(`Failed to decode executed event log: ${e}`);
      },
    );
    if (r?.eventName !== 'OperationExecuted' && r?.eventName !== 'OperationsExecuted') return;

    const proposalHash = asHex(r.args.txHash);

    await this.db.query(
      e.update(e.Transaction, () => ({
        filter_single: { hash: asHex(receipt.transactionHash) },
        set: {
          receipt: e.insert(e.Receipt, {
            success: true,
            responses: 'responses' in r.args ? [...r.args.responses] : [r.args.response],
            gasUsed: receipt.gasUsed.toBigInt(),
            fee: receipt.gasUsed.toBigInt() * receipt.effectiveGasPrice.toBigInt(),
            block: BigInt(receipt.blockNumber),
            timestamp: new Date(block.timestamp * 1000), // block.timestamp is in seconds
          }),
        },
      })),
    );

    Logger.debug(`Proposal executed: ${proposalHash}`);

    await this.proposals.publishProposal(
      { account: asAddress(log.address), hash: proposalHash },
      ProposalEvent.executed,
    );
  }

  private async reverted({ receipt, block }: TransactionData) {
    if (receipt.status !== 0) return;

    const revertReason = await this.getRevertReason(receipt);

    const transaction = e.update(e.Transaction, () => ({
      filter_single: { hash: asHex(receipt.transactionHash) },
      set: {
        receipt: e.insert(e.Receipt, {
          success: false,
          responses: [revertReason],
          gasUsed: receipt.gasUsed.toBigInt(),
          fee: receipt.gasUsed.toBigInt() * receipt.effectiveGasPrice.toBigInt(),
          block: BigInt(receipt.blockNumber),
          timestamp: new Date(block.timestamp * 1000), // block.timestamp is in seconds
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
      { account: asAddress(receipt.from), hash: proposalHash as Hex },
      ProposalEvent.executed,
    );
  }

  private async addMissingJobs() {
    const jobs = await this.queue.getJobs(RUNNING_JOB_STATUSES);

    const orphanedTransactionHashes = await this.db.query(
      e.select(e.Transaction, (t) => ({
        filter: and(
          e.op('not', e.op('exists', t.receipt)),
          jobs.length
            ? e.op(t.hash, 'not in', e.set(...jobs.map((job) => job.data.transaction)))
            : undefined,
        ),
        hash: true,
      })).hash,
    );

    if (orphanedTransactionHashes.length) {
      await this.queue.addBulk(
        orphanedTransactionHashes.map((hash) => ({ data: { transaction: hash as Hex } })),
      );
    }
  }

  private async getRevertReason(receipt: TransactionData['receipt']) {
    const resp = await this.provider.getTransaction(receipt.transactionHash);

    return this.provider.call({ ...resp, type: EIP712_TX_TYPE }, receipt.blockNumber);
  }
}
