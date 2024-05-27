import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { asChain, asDecimal, asHex, asUAddress, isHex } from 'lib';
import { TransactionData, ReceiptsWorker, Receipt } from './receipts.worker';
import { InjectQueue } from '@nestjs/bullmq';
import { ReceiptsQueue } from './receipts.queue';
import e from '~/edgeql-js';
import { DatabaseService } from '../database/database.service';
import { and } from '../database/database.util';
import { ProposalsService } from '../proposals/proposals.service';
import { ProposalEvent } from '../proposals/proposals.input';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { RUNNING_JOB_STATUSES, TypedQueue } from '../util/bull/bull.util';
import { ETH } from 'lib/dapps';
import { runOnce } from '~/util/mutex';
import { ampli } from '~/util/ampli';
import { selectSysTx } from './system-tx.util';
import { NetworksService, Network } from '#/util/networks/networks.service';

@Injectable()
export class TransactionsEvents implements OnModuleInit {
  private log = new Logger(this.constructor.name);

  constructor(
    @InjectQueue(ReceiptsQueue.name)
    private queue: TypedQueue<ReceiptsQueue>,
    private db: DatabaseService,
    @InjectRedis() private redis: Redis,
    private networks: NetworksService,
    private receipts: ReceiptsWorker,
    private proposals: ProposalsService,
  ) {
    this.receipts.onTransaction((data) => this.executed(data));
    this.receipts.onTransaction((data) => this.reverted(data));
  }

  onModuleInit() {
    this.addMissingJobs();
  }

  private async executed({ chain, receipt, block, type }: TransactionData) {
    if (type !== 'transaction' || receipt.status !== 'success') return;

    const response = await this.getResponse(this.networks.get(chain), receipt);

    const systx = selectSysTx(receipt.transactionHash);
    const insertResult = e
      .insert(e.Successful, {
        transaction: systx.proposal,
        systx,
        timestamp: new Date(Number(block.timestamp) * 1000), // block.timestamp is in seconds
        block: BigInt(receipt.blockNumber),
        gasUsed: receipt.gasUsed,
        ethFeePerGas: asDecimal(receipt.effectiveGasPrice, ETH).toString(),
        responses: response.data ? [response.data] : [],
      })
      .unlessConflict();

    const proposal = await this.db.query(
      e.select(insertResult.transaction, () => ({
        id: true,
        account: { address: true, approvers: { user: true } },
      })),
    );
    if (!proposal) return `Transaction already processed: ${receipt.transactionHash}`;

    this.log.debug(`Proposal executed: ${proposal.id}`);
    this.proposals.publish(proposal, ProposalEvent.executed);

    // const usdPerEth = new Decimal(transaction.usdPerFeeToken).div(transaction.ethPerFeeToken);
    const revenue = 0; // new Decimal(0).mul(usdPerEth).toNumber();
    proposal.account.approvers.forEach(({ user }) => {
      ampli.transactionExecuted(user.id, { success: true }, { revenue });
    });
  }

  private async reverted({ chain, receipt, block, type }: TransactionData) {
    if (type !== 'transaction' || receipt.status !== 'reverted') return;

    const response = await this.getResponse(this.networks.get(chain), receipt);

    const systx = selectSysTx(receipt.transactionHash);
    const insertResult = e
      .insert(e.Failed, {
        transaction: systx.proposal,
        systx,
        timestamp: new Date(Number(block.timestamp) * 1000), // block.timestamp is in seconds
        block: BigInt(receipt.blockNumber),
        gasUsed: receipt.gasUsed,
        ethFeePerGas: asDecimal(receipt.effectiveGasPrice, ETH).toString(),
        reason: response.data,
      })
      .unlessConflict();

    const proposal = await this.db.query(
      e.select(insertResult.transaction, () => ({
        id: true,
        account: { address: true, approvers: { user: true } },
      })),
    );
    if (!proposal) return `Transaction already processed: ${receipt.transactionHash}`;

    this.log.debug(`Proposal reverted: ${proposal.id}`);
    this.proposals.publish(proposal, ProposalEvent.executed);

    // const usdPerEth = new Decimal(transaction.usdPerFeeToken).div(transaction.ethPerFeeToken);
    const revenue = 0; // new Decimal(0).mul(usdPerEth).toNumber();
    proposal.account.approvers.forEach(({ user }) => {
      ampli.transactionExecuted(user.id, { success: false }, { revenue });
    });
  }

  private async getResponse(network: Network, receipt: Receipt) {
    const tx = await network.getTransaction({ hash: receipt.transactionHash });

    return /* may throw */ await network.call({
      blockNumber: receipt.blockNumber,
      account: receipt.from,
      gas: tx.gas,
      maxFeePerGas: tx.maxFeePerGas,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
      nonce: tx.nonce,
      to: tx.to,
      value: tx.value,
      data: tx.input,
    });
  }

  private async addMissingJobs() {
    await runOnce(
      async () => {
        const jobs = (await this.queue.getJobs(RUNNING_JOB_STATUSES))
          .map((j) => j.data.transaction)
          .filter(isHex);

        const orphanedTransactions = await this.db.query(
          e.select(e.SystemTx, (t) => ({
            filter: and(
              e.op('not', e.op('exists', t.result)),
              jobs.length ? e.op(t.hash, 'not in', e.set(...jobs)) : undefined,
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
              name: ReceiptsQueue.name,
              data: {
                chain: asChain(asUAddress(t.proposal.account.address)),
                transaction: asHex(t.hash),
                type: 'transaction',
              } as const,
            })),
          );
        }
      },
      {
        redis: this.redis,
        key: 'transactions-missing-jobs',
      },
    );
  }
}
