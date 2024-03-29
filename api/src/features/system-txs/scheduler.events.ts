import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { getAbiItem } from 'viem';
import { ACCOUNT_IMPLEMENTATION, UUID, asChain, asUAddress, asUUID } from 'lib';
import e from '~/edgeql-js';
import { TransactionEventData, ReceiptsWorker } from './receipts.worker';
import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';
import { SchedulerQueue } from './scheduler.worker';
import { FLOW_PRODUCER, QueueData, RUNNING_JOB_STATUSES, TypedQueue } from '../util/bull/bull.util';
import { runOnce } from '~/util/mutex';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { and } from '../database/database.util';
import { FlowJob, FlowProducer } from 'bullmq';
import { SimulationsQueue } from '../simulations/simulations.worker';
import { ReceiptsQueue } from './receipts.queue';
import { Chain } from 'chains';
import { ProposalsService } from '../proposals/proposals.service';
import { ProposalEvent } from '../proposals/proposals.input';
import { selectSysTx } from './system-tx.util';
import { selectTransaction } from '../transactions/transactions.service';

const scheduledEvent = getAbiItem({ abi: ACCOUNT_IMPLEMENTATION.abi, name: 'Scheduled' });
const scheduleCancelledEvent = getAbiItem({
  abi: ACCOUNT_IMPLEMENTATION.abi,
  name: 'ScheduleCancelled',
});

@Injectable()
export class SchedulerEvents implements OnModuleInit {
  private log = new Logger(this.constructor.name);

  constructor(
    private db: DatabaseService,
    private receipts: ReceiptsWorker,
    private accountsCache: AccountsCacheService,
    @InjectQueue(SchedulerQueue.name) private queue: TypedQueue<SchedulerQueue>,
    @InjectRedis() private redis: Redis,
    @InjectFlowProducer(FLOW_PRODUCER)
    private flows: FlowProducer,
    private proposals: ProposalsService,
  ) {
    this.receipts.onEvent(scheduledEvent, (event) => this.scheduled(event));
    this.receipts.onEvent(scheduleCancelledEvent, (event) => this.scheduleCancelled(event));
  }

  onModuleInit() {
    this.addMissingJobs();
  }

  private async scheduled(event: TransactionEventData<typeof scheduledEvent>) {
    const account = asUAddress(event.log.address, event.chain);
    if (!(await this.accountsCache.isAccount(account))) return;

    const scheduledFor = new Date(event.log.args.timestamp * 1000);
    const proposalId = await this.db.query(
      e.insert(e.Scheduled, {
        transaction: selectTransaction(event.log.args.proposal),
        systx: selectSysTx(event.log.transactionHash),
        scheduledFor,
      }).transaction.id,
    );

    if (proposalId) {
      this.flows.add(this.getJob(asUUID(proposalId), event.chain, scheduledFor));
      this.proposals.publish({ id: asUUID(proposalId), account }, ProposalEvent.scheduled);
      this.log.debug(`Scheduled ${proposalId}`);
    }
  }

  private async scheduleCancelled(event: TransactionEventData<typeof scheduleCancelledEvent>) {
    const account = asUAddress(event.log.address, event.chain);
    if (!(await this.accountsCache.isAccount(account))) return;

    const proposalId = await this.db.query(
      e.assert_single(
        e.update(e.Scheduled, (t) => ({
          filter: and(
            e.op(t.transaction, '=', selectTransaction(event.log.args.proposal)),
            e.op(t.transaction.account.address, '=', account),
          ),
          set: { cancelled: true },
        })),
      ).transaction.id,
    );

    if (proposalId) {
      this.queue.remove(event.log.args.proposal);
      this.proposals.publish({ id: asUUID(proposalId), account }, ProposalEvent.cancelled);
      this.log.debug(`Cancelled scheduled ${proposalId}`);
    }
  }

  private getJob(txProposal: UUID, chain: Chain, scheduledFor: Date): FlowJob {
    return {
      queueName: ReceiptsQueue.name,
      name: 'Scheduled transaction',
      data: { chain, transaction: { child: 0 } } satisfies QueueData<ReceiptsQueue>,
      children: [
        {
          queueName: SchedulerQueue.name,
          name: 'Schedule transaction',
          data: { transaction: txProposal } satisfies QueueData<SchedulerQueue>,
          opts: { jobId: txProposal },
          children: [
            {
              queueName: SimulationsQueue.name,
              name: 'Simulate scheduled transaction',
              data: { transaction: txProposal } satisfies QueueData<SimulationsQueue>,
              opts: { delay: scheduledFor.getTime() - Date.now() },
            },
          ],
        },
      ],
    };
  }

  private async addMissingJobs() {
    await runOnce(
      async () => {
        const jobs = await this.queue.getJobs(RUNNING_JOB_STATUSES);

        const orphanedProposals = await this.db.query(
          e.select(e.select(e.Transaction).result.is(e.Scheduled), (s) => ({
            filter: and(
              e.op('not', s.cancelled),
              jobs.length
                ? e.op(
                    s.transaction.id,
                    'not in',
                    e.cast(e.uuid, e.set(...jobs.map((j) => j.data.transaction))),
                  )
                : undefined,
            ),
            transaction: {
              id: true,
              account: { address: true },
            },
            scheduledFor: true,
          })),
        );

        if (orphanedProposals.length)
          await this.flows.addBulk(
            orphanedProposals.map((t) =>
              this.getJob(
                asUUID(t.transaction.id),
                asChain(asUAddress(t.transaction.account.address)),
                new Date(t.scheduledFor!),
              ),
            ),
          );
      },
      {
        redis: this.redis,
        key: 'scheduler-missing-jobs',
      },
    );
  }
}
