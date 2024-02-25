import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import {
  ETH_ADDRESS,
  UUID,
  asAddress,
  asChain,
  asDecimal,
  asHex,
  asUAddress,
  asUUID,
  encodeTransaction,
  isHex,
  isTruthy,
  simulate,
} from 'lib';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { and } from '../database/database.util';
import { OperationsService } from '../operations/operations.service';
import { selectAccount } from '../accounts/accounts.util';
import { SwapOp, TransferFromOp, TransferOp } from '../operations/operations.model';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import {
  RUNNING_JOB_STATUSES,
  TypedJob,
  TypedQueue,
  Worker,
  createQueue,
} from '../util/bull/bull.util';
import { ETH } from 'lib/dapps';
import { selectTransaction } from '~/features/transactions/transactions.service';
import { NetworksService } from '~/features/util/networks/networks.service';
import { proposalTxShape, transactionAsTx } from '~/features/transactions/transactions.util';
import { runOnce } from '~/util/mutex';

type TransferDetails = Parameters<typeof e.insert<typeof e.TransferDetails>>[1];

export const SimulationsQueue = createQueue<{ txProposal: UUID }>('Simulations');
export type SimulationsQueue = typeof SimulationsQueue;

@Injectable()
@Processor(SimulationsQueue.name)
export class SimulationsWorker extends Worker<SimulationsQueue> {
  constructor(
    @InjectQueue(SimulationsQueue.name)
    private queue: TypedQueue<SimulationsQueue>,
    private db: DatabaseService,
    @InjectRedis() private redis: Redis,
    private networks: NetworksService,
    private operations: OperationsService,
  ) {
    super();
  }

  onModuleInit() {
    super.onModuleInit();
    this.addMissingJobs();
  }

  async process(job: TypedJob<SimulationsQueue>) {
    const { txProposal } = job.data;

    const p = await this.db.query(
      e.select(e.Transaction, (p) => ({
        filter_single: { id: txProposal },
        account: { address: true },
        ...proposalTxShape(p),
      })),
    );
    if (!p) return; // Job is complete if the proposal no longer exists

    const account = asUAddress(p.account.address);
    const localAccount = asAddress(account);
    const chain = asChain(account);
    const selectedAccount = selectAccount(account);

    const network = this.networks.get(chain);
    const response = await simulate(
      await encodeTransaction({
        network,
        account: localAccount,
        tx: transactionAsTx(p),
      }),
    ).mapErr((callError) => {
      const e = callError.walk();

      return typeof e === 'object' &&
        e &&
        'data' in e &&
        typeof e.data === 'string' &&
        isHex(e.data)
        ? e.data
        : undefined;
    });

    const transfers: TransferDetails[] = [];
    for (const op of p.operations) {
      if (op.value) {
        transfers.push({
          account: selectedAccount,
          from: localAccount,
          to: op.to,
          tokenAddress: asUAddress(ETH_ADDRESS, chain),
          amount: op.to === localAccount ? '0' : asDecimal(-op.value, ETH).toString(),
          direction: ['Out' as const, ...(op.to === localAccount ? (['In'] as const) : [])],
        });
      }

      const f = await this.operations.decodeCustom(
        {
          to: asAddress(op.to),
          value: op.value || undefined,
          data: asHex(op.data || undefined),
        },
        asChain(account),
      );
      if (f instanceof TransferOp && f.token !== ETH_ADDRESS) {
        transfers.push({
          account: selectedAccount,
          from: localAccount,
          to: f.to,
          tokenAddress: asUAddress(f.token, chain),
          amount: f.to === localAccount ? e.decimal('0') : f.amount.negated().toString(),
          direction: ['Out' as const, ...(localAccount === f.to ? (['In'] as const) : [])],
        });
      } else if (f instanceof TransferFromOp) {
        transfers.push({
          account: selectedAccount,
          from: f.from,
          to: f.to,
          tokenAddress: asUAddress(f.token, chain),
          amount: f.amount.toString(),
          direction: ['Out' as const, ...(localAccount === f.to ? (['In'] as const) : [])],
        });
      } else if (f instanceof SwapOp) {
        transfers.push({
          account: selectedAccount,
          from: op.to,
          to: localAccount,
          tokenAddress: asUAddress(f.toToken, chain),
          amount: f.minimumToAmount.toString(),
          direction: ['In' as const],
        });
      }
    }

    const proposal = selectTransaction(txProposal);
    await this.db.query(
      e.select({
        prevSimulation: e.delete(proposal.simulation, () => ({})),
        proposal: e.update(proposal, () => ({
          set: {
            simulation: e.insert(e.Simulation, {
              success: response.isOk(),
              responses: [response.map((r) => r.data).unwrapOr(null)].filter(isTruthy),
              ...(transfers.length && {
                transfers: e.set(...transfers.map((t) => e.insert(e.TransferDetails, t))),
              }),
            }),
          },
        })),
      }),
    );
  }

  private async addMissingJobs() {
    await runOnce(
      async () => {
        const jobs = await this.queue.getJobs(RUNNING_JOB_STATUSES);

        const orphanedProposals = await this.db.query(
          e.select(e.Transaction, (p) => ({
            filter: and(
              e.op('not', e.op('exists', p.simulation)),
              jobs.length
                ? e.op(
                    p.id,
                    'not in',
                    e.cast(e.uuid, e.set(...jobs.map((job) => job.data.txProposal))),
                  )
                : undefined,
            ),
          })).id,
        );

        if (orphanedProposals.length) {
          await this.queue.addBulk(
            orphanedProposals.map((id) => ({
              name: SimulationsQueue.name,
              data: { txProposal: asUUID(id) },
            })),
          );
        }
      },
      {
        redis: this.redis,
        key: 'simulations-missing-jobs',
      },
    );
  }
}
