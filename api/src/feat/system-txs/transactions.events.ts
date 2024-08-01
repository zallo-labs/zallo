import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { asChain, asDecimal, asHex, asUAddress, isHex } from 'lib';
import {
  ConfirmationData,
  ConfirmationEventData,
  ConfirmationsWorker,
  Receipt,
} from './confirmations.worker';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfirmationQueue } from './confirmations.queue';
import e from '~/edgeql-js';
import { DatabaseService } from '~/core/database';
import { and } from '~/core/database';
import { ProposalsService } from '../proposals/proposals.service';
import { ProposalEvent } from '../proposals/proposals.input';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { QueueData, RUNNING_JOB_STATUSES, TypedQueue } from '~/core/bull/bull.util';
import { ETH } from 'lib/dapps';
import { runOnce } from '~/util/mutex';
import { ampli } from '~/util/ampli';
import { selectSysTx } from './system-tx.util';
import { NetworksService, Network } from '~/core/networks';
import { AccountsCacheService } from '../auth/accounts.cache.service';

@Injectable()
export class TransactionsEvents implements OnModuleInit {
  private log = new Logger(this.constructor.name);

  constructor(
    @InjectQueue(ConfirmationQueue.name)
    private queue: TypedQueue<ConfirmationQueue>,
    private db: DatabaseService,
    @InjectRedis() private redis: Redis,
    private networks: NetworksService,
    private confirmations: ConfirmationsWorker,
    private proposals: ProposalsService,
    private accountsCache: AccountsCacheService,
  ) {
    this.confirmations.on((data) => this.executed(data));
    this.confirmations.on((data) => this.reverted(data));
  }

  onModuleInit() {
    this.addMissingJobs();
  }

  private async executed({ chain, receipt }: ConfirmationData) {
    if (receipt.status !== 'success') return;
    if (!(await this.accountsCache.isAccount(asUAddress(receipt.from, chain)))) return;

    const network = this.networks.get(chain);
    const response = await this.getResponse(network, receipt);
    const block = await network.getBlock({
      blockNumber: receipt.blockNumber,
      includeTransactions: false,
    });

    const systx = selectSysTx(receipt.transactionHash);
    const insertResult = e
      .insert(e.ConfirmedSuccess, {
        transaction: systx.proposal,
        systx,
        timestamp: new Date(Number(block.timestamp) * 1000), // block.timestamp is in seconds
        block: BigInt(receipt.blockNumber),
        gasUsed: receipt.gasUsed,
        ethFeePerGas: asDecimal(receipt.effectiveGasPrice, ETH).toString(),
        response: response.data,
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
    this.proposals.event(proposal, ProposalEvent.executed);

    // const usdPerEth = new Decimal(transaction.usdPerFeeToken).div(transaction.ethPerFeeToken);
    const revenue = 0; // new Decimal(0).mul(usdPerEth).toNumber();
    proposal.account.approvers.forEach(({ user }) => {
      ampli.transactionExecuted(user.id, { success: true }, { revenue });
    });
  }

  private async reverted({ chain, receipt }: ConfirmationData) {
    if (receipt.status !== 'reverted') return;
    if (!(await this.accountsCache.isAccount(asUAddress(receipt.from, chain)))) return;

    const network = this.networks.get(chain);
    const response = await this.getResponse(network, receipt);
    const block = await network.getBlock({
      blockNumber: receipt.blockNumber,
      includeTransactions: false,
    });

    const systx = selectSysTx(receipt.transactionHash);
    const insertResult = e
      .insert(e.ConfirmedFailure, {
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
    this.proposals.event(proposal, ProposalEvent.executed);

    // const usdPerEth = new Decimal(transaction.usdPerFeeToken).div(transaction.ethPerFeeToken);
    const revenue = 0; // new Decimal(0).mul(usdPerEth).toNumber();
    proposal.account.approvers.forEach(({ user }) => {
      ampli.transactionExecuted(user.id, { success: false }, { revenue });
    });
  }

  private async getResponse(network: Network, receipt: Receipt) {
    const tx = await network.getTransaction({ hash: receipt.transactionHash });

    return /* may throw */ await network.call({
      blockNumber: receipt.blockNumber - 1n,
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
              name: ConfirmationQueue.name,
              data: {
                chain: asChain(asUAddress(t.proposal.account.address)),
                transaction: asHex(t.hash),
              } satisfies QueueData<ConfirmationQueue>,
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
