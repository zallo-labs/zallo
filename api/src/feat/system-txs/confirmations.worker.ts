import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ConfirmationQueue } from './confirmations.queue';
import { NetworksService } from '~/core/networks/networks.service';
import { Chain, ChainConfig, Network } from 'chains';
import { FormattedTransactionReceipt } from 'viem';
import { AbiEvent } from 'abitype';
import { QueueData, RUNNING_JOB_STATUSES, TypedJob } from '~/core/bull/bull.util';
import { Worker } from '~/core/bull/Worker';
import { asChain, asDecimal, asHex, asUAddress, isHex } from 'lib';
import { EventsService, Log } from '../events/events.service';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { and, DatabaseService } from '~/core/database';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { ProposalsService } from '../proposals/proposals.service';
import { ProposalEvent } from '../proposals/proposals.input';
import e from '~/edgeql-js';
import { ETH } from 'lib/dapps';
import { ampli } from '~/util/ampli';
import { runOnce } from '~/util/mutex';
import { selectSysTx } from './system-tx.util';

export type Receipt = FormattedTransactionReceipt<ChainConfig>;
export interface ConfirmationData {
  chain: Chain;
  receipt: Receipt;
}

@Injectable()
@Processor(ConfirmationQueue.name, { autorun: false })
export class ConfirmationsWorker extends Worker<ConfirmationQueue> {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private events: EventsService,
    @InjectRedis() private redis: Redis,
    private proposals: ProposalsService,
    private accountsCache: AccountsCacheService,
  ) {
    super();
  }

  async process(job: TypedJob<ConfirmationQueue>) {
    const { chain } = job.data;
    const hash = isHex(job.data.transaction)
      ? job.data.transaction
      : await (async () => {
          const v =
            typeof job.data.transaction === 'object' &&
            Object.values(await job.getChildrenValues())[job.data.transaction.child];

          return isHex(v) ? v : undefined;
        })();
    if (!hash) return;

    await job.updateData({ ...job.data, transaction: hash });

    const receipt = await this.networks.get(chain).waitForTransactionReceipt({
      hash,
      timeout: 60_000,
      pollingInterval: 500,
    });

    return receipt.status === 'success'
      ? await this.executed({ chain, receipt })
      : await this.reverted({ chain, receipt });
  }

  private async executed({ chain, receipt }: ConfirmationData) {
    if (!(await this.accountsCache.isAccount(asUAddress(receipt.from, chain)))) return;

    const network = this.networks.get(chain);
    const response = await this.getResponse(network, receipt);

    const systx = selectSysTx(receipt.transactionHash);
    const insertResult = e
      .insert(e.ConfirmedSuccess, {
        transaction: systx.proposal,
        systx,
        timestamp: new Date(), // block.timestamp not used as timestamp is used for ordering and time drift issues
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

    await this.events.processConfirmed({
      chain,
      logs: receipt.logs as unknown as Log<AbiEvent, true>[],
      receipt,
    });
    this.proposals.event(proposal, ProposalEvent.executed);

    proposal.account.approvers.forEach(({ user }) => {
      ampli.transactionExecuted(user.id, { success: true });
    });
  }

  private async reverted({ chain, receipt }: ConfirmationData) {
    if (!(await this.accountsCache.isAccount(asUAddress(receipt.from, chain)))) return;

    const network = this.networks.get(chain);
    const response = await this.getResponse(network, receipt);

    const systx = selectSysTx(receipt.transactionHash);
    const insertResult = e
      .insert(e.ConfirmedFailure, {
        transaction: systx.proposal,
        systx,
        timestamp: new Date(), // block.timestamp not used as timestamp is used for ordering and time drift issues
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

    this.log.debug(`Proposal reverted: ${proposal.id}`);
    this.proposals.event(proposal, ProposalEvent.executed);

    proposal.account.approvers.forEach(({ user }) => {
      ampli.transactionExecuted(user.id, { success: false });
    });
  }

  private async getResponse(network: Network, receipt: Receipt) {
    const tx = await network.getTransaction({ hash: receipt.transactionHash });
    const r = /* may throw */ await network.call({
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

    return {
      ...r,
      data: r.data ?? '0x',
    };
  }

  async bootstrap() {
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
