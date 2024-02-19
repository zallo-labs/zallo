import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { getAbiItem } from 'viem';
import { ACCOUNT_IMPLEMENTATION, UUID, asUAddress, asUUID } from 'lib';
import e from '~/edgeql-js';
import { TransactionEventData, TransactionsWorker } from './transactions.worker';
import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';
import { SchedulerQueue } from './scheduler.worker';
import { FLOW_PRODUCER, QueueData, RUNNING_JOB_STATUSES, TypedQueue } from '../util/bull/bull.util';
import { runOnce } from '~/util/mutex';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { and } from '../database/database.util';
import { FlowJob, FlowProducer } from 'bullmq';
import { SimulationsQueue } from '../simulations/simulations.worker';

const scheduledEvent = getAbiItem({ abi: ACCOUNT_IMPLEMENTATION.abi, name: 'Scheduled' });
const scheduleCancelledEvent = getAbiItem({
  abi: ACCOUNT_IMPLEMENTATION.abi,
  name: 'ScheduleCancelled',
});

@Injectable()
export class SchedulerEvents implements OnModuleInit {
  constructor(
    private db: DatabaseService,
    private transactionsProcessor: TransactionsWorker,
    private accountsCache: AccountsCacheService,
    @InjectQueue(SchedulerQueue.name) private queue: TypedQueue<SchedulerQueue>,
    @InjectRedis() private redis: Redis,
    @InjectFlowProducer(FLOW_PRODUCER)
    private flows: FlowProducer,
  ) {
    this.transactionsProcessor.onEvent(scheduledEvent, (event) => this.scheduled(event));
    this.transactionsProcessor.onEvent(scheduleCancelledEvent, (event) =>
      this.scheduleCancelled(event),
    );
  }

  onModuleInit() {
    this.addMissingJobs();
  }

  private async scheduled(event: TransactionEventData<typeof scheduledEvent>) {
    const account = asUAddress(event.log.address, event.chain);
    if (!(await this.accountsCache.isAccount(account))) return;

    const transaction = e.select(e.Transaction, () => ({
      filter_single: { hash: event.log.transactionHash },
    }));

    const scheduledFor = new Date(Number(event.log.args.timestamp) * 1000);
    const proposalId = await this.db.query(
      e.update(transaction, () => ({ set: { scheduledFor } })).proposal.id,
    );

    if (proposalId) this.flows.add(this.getJob(asUUID(proposalId), scheduledFor));
  }

  private async scheduleCancelled(event: TransactionEventData<typeof scheduleCancelledEvent>) {
    const account = asUAddress(event.log.address, event.chain);
    if (!(await this.accountsCache.isAccount(account))) return;

    const transaction = e.select(e.Transaction, () => ({
      filter_single: { hash: event.log.transactionHash },
    }));

    const proposalId = await this.db.query(
      e.update(transaction, () => ({ set: { cancelled: true } })).proposal.id,
    );

    if (proposalId) this.queue.remove(event.log.args.proposal);
  }

  private getJob(txProposal: UUID, scheduledFor: Date): FlowJob {
    return {
      queueName: SchedulerQueue.name,
      name: 'Schedule transaction',
      data: { transactionProposal: txProposal } satisfies QueueData<SchedulerQueue>,
      opts: { jobId: txProposal },
      children: [
        {
          queueName: SimulationsQueue.name,
          name: 'Simulate scheduled transaction',
          data: { txProposal } satisfies QueueData<SimulationsQueue>,
          opts: { delay: scheduledFor.getTime() - Date.now() },
        },
      ],
    };
  }

  private async addMissingJobs() {
    await runOnce(
      async () => {
        const jobs = await this.queue.getJobs(RUNNING_JOB_STATUSES);

        const orphanedProposals = await this.db.query(
          e.select(e.Transaction, (t) => ({
            filter: and(
              e.op('not', e.op('exists', t.receipt)),
              e.op('exists', t.scheduledFor),
              e.op('not', t.cancelled),
              jobs.length
                ? e.op(
                    t.proposal.id,
                    'not in',
                    e.cast(e.uuid, e.set(...jobs.map((j) => j.data.transactionProposal))),
                  )
                : undefined,
            ),
            proposal: true,
            scheduledFor: true,
          })),
        );

        if (orphanedProposals.length)
          await this.flows.addBulk(
            orphanedProposals.map((t) =>
              this.getJob(asUUID(t.proposal.id), new Date(t.scheduledFor!)),
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
