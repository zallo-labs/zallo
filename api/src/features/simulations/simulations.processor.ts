import { BullModuleOptions, InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { Hex, ZERO_ADDR, asAddress, asHex } from 'lib';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { and } from '../database/database.util';
import { OperationsService } from '../operations/operations.service';
import { selectAccount } from '../accounts/accounts.util';
import { SwapOp, TransferFromOp, TransferOp } from '../operations/operations.model';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { Mutex } from 'redis-semaphore';
import { RUNNING_JOB_STATUSES } from '../util/bull/bull.util';

type TransferDetails = Parameters<typeof e.insert<typeof e.TransferDetails>>[1];

export interface SimulationRequest {
  transactionProposalHash: Hex;
}

export const SIMULATIONS_QUEUE = {
  name: 'Simulations',
} satisfies BullModuleOptions;

@Injectable()
@Processor(SIMULATIONS_QUEUE.name)
export class SimulationsProcessor implements OnModuleInit {
  constructor(
    @InjectQueue(SIMULATIONS_QUEUE.name)
    private queue: Queue<SimulationRequest>,
    private db: DatabaseService,
    @InjectRedis() private redis: Redis,
    private operations: OperationsService,
  ) {}

  async onModuleInit() {
    const mutex = new Mutex(this.redis, 'simulations-missing-jobs', {
      lockTimeout: Number.POSITIVE_INFINITY,
    });
    try {
      if (await mutex.tryAcquire()) await this.addMissingJobs();
    } finally {
      await mutex.release();
    }
  }

  @Process()
  async process(job: Job<SimulationRequest>) {
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

    const accountAddress = asAddress(p.account.address);
    const account = selectAccount(accountAddress);
    const transfers: TransferDetails[] = [];

    for (const op of p.operations) {
      if (op.value) {
        transfers.push({
          account,
          from: accountAddress,
          to: op.to,
          tokenAddress: ZERO_ADDR,
          amount: op.to === accountAddress ? 0n : -op.value,
        });
      }

      const f = await this.operations.decodeCustom({
        to: asAddress(op.to),
        value: op.value || undefined,
        data: asHex(op.data || undefined),
      });
      if (f instanceof TransferOp && f.token !== ZERO_ADDR) {
        transfers.push({
          account,
          from: accountAddress,
          to: f.to,
          tokenAddress: f.token,
          amount: f.to === accountAddress ? 0n : -f.amount,
        });
      } else if (f instanceof TransferFromOp) {
        transfers.push({
          account,
          from: f.from,
          to: f.to,
          tokenAddress: f.token,
          amount: f.amount,
        });
      } else if (f instanceof SwapOp) {
        transfers.push({
          account,
          from: op.to,
          to: accountAddress,
          tokenAddress: f.toToken,
          amount: f.minimumToAmount,
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
        orphanedProposals.map((hash) => ({ data: { transactionProposalHash: hash as Hex } })),
      );
    }
  }
}
