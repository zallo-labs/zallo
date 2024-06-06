import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import {
  Address,
  ETH_ADDRESS,
  UUID,
  asAddress,
  asChain,
  asDecimal,
  asHex,
  asUAddress,
  asUUID,
  decodeTransfer,
  isHex,
  isTruthy,
  simulate,
} from 'lib';
import { DatabaseService } from '../database/database.service';
import e, { $infer } from '~/edgeql-js';
import { and } from '../database/database.util';
import { OperationsService } from '../operations/operations.service';
import { selectAccount } from '../accounts/accounts.util';
import { SwapOp, TransferFromOp, TransferOp } from '../operations/operations.model';
import { RUNNING_JOB_STATUSES, TypedJob, createQueue } from '../util/bull/bull.util';
import { Worker } from '#/util/bull/Worker';
import { ETH } from 'lib/dapps';
import { NetworksService } from '~/features/util/networks/networks.service';
import { TX_SHAPE, transactionAsTx } from '~/features/transactions/transactions.util';
import { Shape } from '../database/database.select';
import { TokensService } from '../tokens/tokens.service';
import { selectTransaction } from '../transactions/transactions.service';
import { SelectedPolicies, selectPolicy } from '../policies/policies.util';
import { ProposalsService } from '../proposals/proposals.service';
import { ProposalEvent } from '../proposals/proposals.input';

export const SimulationsQueue = createQueue<{ transaction: UUID }>('Simulations');
export type SimulationsQueue = typeof SimulationsQueue;

type TransferDetails = Parameters<typeof e.insert<typeof e.TransferDetails>>[1];

const TransactionExecutableShape = {
  account: { address: true },
  approvals: { approver: { address: true } },
  policy: { id: true, isActive: true, threshold: true },
  validationErrors: true,
  ...TX_SHAPE,
} satisfies Shape<typeof e.Transaction>;
const s_ = e.assert_exists(
  e.assert_single(e.select(e.Transaction, () => TransactionExecutableShape)),
);
type TransactionExecutableShape = $infer<typeof s_>;

@Injectable()
@Processor(SimulationsQueue.name, { autorun: false })
export class SimulationsWorker extends Worker<SimulationsQueue> {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private operations: OperationsService,
    private tokens: TokensService,
    private proposals: ProposalsService,
  ) {
    super();
  }

  async process(job: TypedJob<SimulationsQueue>) {
    const proposal = selectTransaction(job.data.transaction);
    const p = await this.db.query(e.select(proposal, () => TransactionExecutableShape));
    if (!p) return 'Transaction not found';

    const promisedExecutable = this.isExecutable(p);
    const account = asUAddress(p.account.address);
    const localAccount = asAddress(account);
    const chain = asChain(account);
    const selectedAccount = selectAccount(account);

    const simulations = await Promise.all(
      p.operations.map(async (op) =>
        (
          await simulate({
            network: this.networks.get(chain),
            account: localAccount,
            gas: p.gasLimit,
            type: 'eip712',
            to: asAddress(op.to),
            value: op.value ?? 0n,
            data: asHex(op.data) ?? '0x',
          })
        ).mapErr((callError) => {
          const e = callError.walk();

          return typeof e === 'object' &&
            e &&
            'data' in e &&
            typeof e.data === 'string' &&
            isHex(e.data)
            ? e.data
            : undefined;
        }),
      ),
    );
    const success = simulations.every((r) => r.isOk());
    const responses = simulations
      .filter((r) => success || r.isErr())
      .map((r) =>
        r.match(
          (r) => r.data,
          (r) => r,
        ),
      )
      .filter(isTruthy);

    const transfers: Omit<TransferDetails, 'account'>[] = [];
    for (const op of p.operations) {
      if (op.value) {
        transfers.push({
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
          from: localAccount,
          to: f.to,
          tokenAddress: asUAddress(f.token, chain),
          amount: f.to === localAccount ? e.decimal('0') : f.amount.negated().toString(),
          direction: ['Out' as const, ...(localAccount === f.to ? (['In'] as const) : [])],
        });
      } else if (f instanceof TransferFromOp) {
        transfers.push({
          from: f.from,
          to: f.to,
          tokenAddress: asUAddress(f.token, chain),
          amount: f.amount.toString(),
          direction: ['Out' as const, ...(localAccount === f.to ? (['In'] as const) : [])],
        });
      } else if (f instanceof SwapOp) {
        transfers.push({
          from: op.to,
          to: localAccount,
          tokenAddress: asUAddress(f.toToken, chain),
          amount: f.minimumToAmount.toString(),
          direction: ['In' as const],
        });
      }
    }

    const executable = await promisedExecutable;
    await this.db.query(
      e.select({
        prevSimulation: e.delete(proposal.simulation, () => ({})),
        proposal: e.update(proposal, () => ({
          set: {
            executable,
            simulation: e.insert(e.Simulation, {
              success,
              responses,
              ...(transfers.length && {
                transfers: e.with(
                  [selectedAccount],
                  e.for(e.set(...transfers.map((t) => e.json(t))), (t) =>
                    e.insert(e.TransferDetails, {
                      account: selectedAccount,
                      from: e.cast(e.Address, t.from),
                      to: e.cast(e.Address, t.to),
                      tokenAddress: e.cast(e.UAddress, t.tokenAddress),
                      amount: e.cast(e.decimal, e.cast(e.str, t.amount)),
                      direction: e.cast(e.TransferDirection, e.json_array_unpack(t.direction)),
                    }),
                  ),
                ),
              }),
            }),
          },
        })),
      }),
    );

    this.proposals.publish({ id: job.data.transaction, account }, ProposalEvent.simulated);

    return { executable };
  }

  private async isExecutable(t: TransactionExecutableShape) {
    if (!t.policy.isActive) return false;
    if (t.validationErrors.length) return false;

    const approved = t.policy.threshold <= t.approvals.length;
    if (!approved) return false;

    // Check all limits
    const transfers = transactionAsTx(t)
      .operations.map(decodeTransfer)
      .reduce<Record<Address, bigint>>((transfers, t) => {
        // Aggregate transfers by token
        if (t) {
          transfers[t.token] ??= 0n;
          transfers[t.token] += t.amount;
        }
        return transfers;
      }, {});

    const chain = asChain(asUAddress(t.account.address));
    const selectedPolicy = selectPolicy(t.policy.id) as unknown as SelectedPolicies;
    const limitResults = await Promise.all(
      Object.entries(transfers).map(async ([localToken, amount]) => {
        const token = asUAddress(localToken, chain);
        const { remaining } = await this.tokens.policySpending(token, selectedPolicy);

        return remaining === undefined || remaining.gte(await this.tokens.asDecimal(token, amount));
      }),
    );

    return limitResults.every((r) => r);
  }

  async bootstrap() {
    const jobs = await this.queue.getJobs(RUNNING_JOB_STATUSES);

    const orphanedTransactions = await this.db.query(
      e.select(e.Transaction, (p) => ({
        filter: and(
          e.op('not', e.op('exists', p.simulation)),
          jobs.length
            ? e.op(
                p.id,
                'not in',
                e.cast(e.uuid, e.set(...jobs.map((job) => job.data.transaction))),
              )
            : undefined,
        ),
      })).id,
    );

    if (orphanedTransactions.length) {
      await this.queue.addBulk(
        orphanedTransactions.map((id) => ({
          name: SimulationsQueue.name,
          data: { transaction: asUUID(id) },
        })),
      );
    }
  }
}
