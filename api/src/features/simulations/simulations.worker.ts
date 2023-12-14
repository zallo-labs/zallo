import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ETH_ADDRESS, Hex, asAddress, asChain, asDecimal, asHex, asUAddress } from 'lib';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { and } from '../database/database.util';
import { OperationsService } from '../operations/operations.service';
import { selectAccount } from '../accounts/accounts.util';
import { SwapOp, TransferFromOp, TransferOp } from '../operations/operations.model';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { Mutex } from 'redis-semaphore';
import {
  RUNNING_JOB_STATUSES,
  TypedJob,
  TypedQueue,
  TypedWorker,
  createQueue,
} from '../util/bull/bull.util';
import { ETH } from 'lib/dapps';

type TransferDetails = Parameters<typeof e.insert<typeof e.TransferDetails>>[1];

export const SIMULATIONS_QUEUE = createQueue<{ transactionProposalHash: Hex }>('Simulations');

@Injectable()
@Processor(SIMULATIONS_QUEUE.name)
export class SimulationsWorker
  extends WorkerHost<TypedWorker<typeof SIMULATIONS_QUEUE>>
  implements OnModuleInit
{
  constructor(
    @InjectQueue(SIMULATIONS_QUEUE.name)
    private queue: TypedQueue<typeof SIMULATIONS_QUEUE>,
    private db: DatabaseService,
    @InjectRedis() private redis: Redis,
    private operations: OperationsService,
  ) {
    super();
  }

  async onModuleInit() {
    const mutex = new Mutex(this.redis, 'simulations-missing-jobs', { lockTimeout: 60_000 });
    try {
      if (await mutex.tryAcquire()) await this.addMissingJobs();
    } finally {
      await mutex.release();
    }
  }

  async process(job: TypedJob<typeof SIMULATIONS_QUEUE>) {
    const hash = job.data.transactionProposalHash;

    const p = await this.db.query(
      e.select(e.TransactionProposal, () => ({
        filter_single: { hash },
        account: { address: true },
        operations: {
          to: true,
          value: true,
          data: true,
        },
      })),
    );

    // Job is complete if the proposal no longer exists
    if (!p) return;

    const accountUAddress = asUAddress(p.account.address);
    const accountAddress = asAddress(accountUAddress);
    const chain = asChain(accountUAddress);
    const account = selectAccount(accountUAddress);

    const transfers: TransferDetails[] = [];
    for (const op of p.operations) {
      if (op.value) {
        transfers.push({
          account,
          from: accountAddress,
          to: op.to,
          tokenAddress: asUAddress(ETH_ADDRESS, chain),
          amount: op.to === accountAddress ? '0' : asDecimal(-op.value, ETH).toString(),
          direction: ['Out' as const, ...(op.to === accountAddress ? (['In'] as const) : [])],
        });
      }

      const f = await this.operations.decodeCustom(
        {
          to: asAddress(op.to),
          value: op.value || undefined,
          data: asHex(op.data || undefined),
        },
        asChain(accountUAddress),
      );
      if (f instanceof TransferOp && f.token !== ETH_ADDRESS) {
        transfers.push({
          account,
          from: accountAddress,
          to: f.to,
          tokenAddress: asUAddress(f.token, chain),
          amount: f.to === accountAddress ? e.decimal('0') : f.amount.negated().toString(),
          direction: ['Out' as const, ...(accountAddress === f.to ? (['In'] as const) : [])],
        });
      } else if (f instanceof TransferFromOp) {
        transfers.push({
          account,
          from: f.from,
          to: f.to,
          tokenAddress: asUAddress(f.token, chain),
          amount: f.amount.toString(),
          direction: ['Out' as const, ...(accountAddress === f.to ? (['In'] as const) : [])],
        });
      } else if (f instanceof SwapOp) {
        transfers.push({
          account,
          from: op.to,
          to: accountAddress,
          tokenAddress: asUAddress(f.toToken, chain),
          amount: f.minimumToAmount.toString(),
          direction: ['In' as const],
        });
      }
    }

    await this.db.query(
      e.update(e.TransactionProposal, () => ({
        filter_single: { hash },
        set: {
          simulation: e.insert(e.Simulation, {
            ...(transfers.length && {
              transfers: e.set(...transfers.map((t) => e.insert(e.TransferDetails, t))),
            }),
          }),
        },
      })),
    );
  }

  private async addMissingJobs() {
    const jobs = await this.queue.getJobs(RUNNING_JOB_STATUSES);

    const orphanedProposals = await this.db.query(
      e.select(e.TransactionProposal, (p) => ({
        filter: and(
          e.op('not', e.op('exists', p.simulation)),
          jobs.length
            ? e.op(p.hash, 'not in', e.set(...jobs.map((job) => job.data.transactionProposalHash)))
            : undefined,
        ),
        hash: true,
      })).hash,
    );

    if (orphanedProposals.length) {
      await this.queue.addBulk(
        orphanedProposals.map((hash) => ({
          name: SIMULATIONS_QUEUE.name,
          data: { transactionProposalHash: asHex(hash) },
        })),
      );
    }
  }
}
