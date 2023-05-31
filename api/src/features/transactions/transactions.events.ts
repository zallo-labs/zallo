import { Injectable, OnModuleInit } from '@nestjs/common';
import { ACCOUNT_INTERFACE as ACCOUNT, asAddress, asHex, Hex } from 'lib';
import { BytesLike } from 'ethers';
import { hexDataLength } from 'ethers/lib/utils';
import { ProposalsService } from '../proposals/proposals.service';
import { ProposalEvent } from '../proposals/proposals.input';
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

@Injectable()
export class TransactionsEvents implements OnModuleInit {
  constructor(
    @InjectQueue(TRANSACTIONS_QUEUE.name)
    private queue: Queue<TransactionEvent>,
    private db: DatabaseService,
    private provider: ProviderService,
    private transactionsProcessor: TransactionsProcessor,
    private proposals: ProposalsService,
  ) {
    this.transactionsProcessor.onEvent(
      ACCOUNT.getEventTopic(ACCOUNT.events['TransactionExecuted(bytes32,bytes)']),
      (data) => this.executed(data),
    );
    this.transactionsProcessor.onTransaction((data) => this.reverted(data));
  }

  onModuleInit() {
    this.addMissingJobs();
  }

  private async executed({ log, receipt, block }: TransactionEventData) {
    const r = ACCOUNT.decodeEventLog(
      ACCOUNT.events['TransactionExecuted(bytes32,bytes)'],
      log.data,
      log.topics,
    );
    const [proposalHash, response] = [asHex(r[0] as BytesLike), asHex(r[1] as BytesLike)];

    await this.db.query(
      e.update(e.Transaction, () => ({
        filter_single: { hash: asHex(receipt.transactionHash) },
        set: {
          receipt: e.insert(e.Receipt, {
            success: true,
            response: hexDataLength(response) ? response : undefined,
            gasUsed: receipt.gasUsed.toBigInt(),
            fee: receipt.gasUsed.toBigInt() * receipt.effectiveGasPrice.toBigInt(),
            block: BigInt(receipt.blockNumber),
            timestamp: new Date(block.timestamp * 1000), // block.timestamp is in seconds
          }),
        },
      })),
    );

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
          response: revertReason,
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

    await this.proposals.publishProposal(
      { account: asAddress(receipt.contractAddress), hash: proposalHash as Hex },
      ProposalEvent.executed,
    );
  }

  private async addMissingJobs() {
    const jobs = await this.queue.getJobs(['waiting', 'active', 'delayed', 'paused']);

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

    if (!orphanedTransactionHashes.length) {
      await this.queue.addBulk(
        orphanedTransactionHashes.map((hash) => ({ data: { transaction: hash as Hex } })),
      );
    }
  }

  private async getRevertReason(receipt: TransactionData['receipt']) {
    const resp = await this.provider.getTransaction(receipt.transactionHash);

    const reason = await this.provider.call({ ...resp, type: EIP712_TX_TYPE }, receipt.blockNumber);

    return hexDataLength(reason) > 0 ? reason : undefined;
  }
}
