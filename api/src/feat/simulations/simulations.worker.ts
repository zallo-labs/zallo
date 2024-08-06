import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import {
  Address,
  ETH_TOKEN_ADDRESS,
  Hex,
  UUID,
  asAddress,
  asChain,
  asHex,
  asUAddress,
  asUUID,
  decodeTransfer,
  encodeOperations,
  tryOrIgnore,
} from 'lib';
import { DatabaseService } from '~/core/database';
import e, { $infer } from '~/edgeql-js';
import { and } from '~/core/database';
import { RUNNING_JOB_STATUSES, TypedJob, createQueue } from '~/core/bull/bull.util';
import { Worker } from '~/core/bull/Worker';
import { ERC20 } from 'lib/dapps';
import { NetworksService } from '~/core/networks';
import { TX_SHAPE, transactionAsTx } from '~/feat/transactions/transactions.util';
import { Shape } from '~/core/database';
import { TokensService } from '../tokens/tokens.service';
import { selectTransaction } from '../transactions/transactions.util';
import { SelectedPolicies, selectPolicy } from '../policies/policies.util';
import { ProposalsService } from '../proposals/proposals.service';
import { ProposalEvent } from '../proposals/proposals.input';
import {
  Abi,
  ContractEventName,
  decodeFunctionData,
  encodeEventTopics,
  getAbiItem,
  size,
  slice,
} from 'viem';
import { insertSimulatedSuccess } from './insert-simulated-success.query';
import { insertSimulatedFailure } from './insert-simulated-failure.query';
import { EventsService, Log } from '../events/events.service';
import { encodeEventData, EncodeEventDataParameters } from '~/core/networks/encodeEventData';
import { match } from 'ts-pattern';

export const SimulationsQueue = createQueue<{ transaction: UUID | Hex }>('Simulations');
export type SimulationsQueue = typeof SimulationsQueue;

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
    private tokens: TokensService,
    private proposals: ProposalsService,
    private events: EventsService,
  ) {
    super();
  }

  async process(job: TypedJob<SimulationsQueue>) {
    const proposal = selectTransaction(job.data.transaction);
    const t = await this.db.query(
      e.select(proposal, () => ({
        id: true,
        ...TransactionExecutableShape,
      })),
    );
    if (!t) return 'Transaction not found';

    const validationErrorsPromise = this.getValidationErrors(t);
    const account = asUAddress(t.account.address);
    const localAccount = asAddress(account);
    const chain = asChain(account);
    const network = this.networks.get(chain);

    const trace = await network.traceCall({
      request: {
        from: localAccount,
        ...encodeOperations(
          t.operations.map((op) => ({
            to: asAddress(op.to),
            data: asHex(op.data ?? '0x'),
            value: op.value ? BigInt(op.value) : undefined,
          })),
        ),
      },
    });

    const error = trace.error || trace.revertReason;
    const validationErrors = await validationErrorsPromise;
    const success = !error && !validationErrors.length;

    const result = await (success
      ? this.db.exec(insertSimulatedSuccess, {
          transaction: t.id,
          response: trace.output,
          gasUsed: trace.gasUsed,
        })
      : this.db.exec(insertSimulatedFailure, {
          transaction: t.id,
          response: trace.output,
          gasUsed: trace.gasUsed,
          reason: error ?? '',
          validationErrors,
        }));

    const logs = await this.simulateEvents(t);
    await this.events.processSimulatedAndOptimistic({ chain, logs, result: asUUID(result.id) });

    this.proposals.event({ id: asUUID(t.id), account }, ProposalEvent.simulated);

    return { executable: success };
  }

  private async simulateEvents(t: TransactionExecutableShape) {
    const account = asAddress(t.account.address);

    const logs: Log<undefined, false>[] = [];
    for (const op of t.operations) {
      // Native transfer
      if (op.value) {
        logs.push({
          address: ETH_TOKEN_ADDRESS,
          ...encodeEvent({
            abi: ERC20,
            eventName: 'Transfer',
            args: {
              from: account,
              to: asAddress(op.to),
            },
          }),
        });
      }

      const EVENTS_ABI = [
        getAbiItem({ abi: ERC20, name: 'transfer' }),
        getAbiItem({ abi: ERC20, name: 'transferFrom' }),
        // getAbiItem({ abi: ERC20, name: 'approve' }),
        // getAbiItem({ abi: SYNCSWAP.router.abi, name: 'swap' }),
      ];

      const data = asHex(op.data);
      const selector = data && size(data) >= 4 && slice(data, 0, 4);
      if (!selector) continue;

      const f = tryOrIgnore(() => decodeFunctionData({ abi: EVENTS_ABI, data }));
      match(f)
        .with({ functionName: 'transfer' }, (f) => {
          logs.push({
            address: asAddress(op.to),
            ...encodeEvent({
              abi: ERC20,
              eventName: 'Transfer',
              args: {
                from: account,
                to: f.args[0],
                value: f.args[1],
              },
            }),
          });
        })
        .with({ functionName: 'transferFrom' }, (f) => {
          logs.push({
            address: asAddress(op.to),
            ...encodeEvent({
              abi: ERC20,
              eventName: 'Transfer',
              args: {
                from: f.args[0],
                to: f.args[1],
                value: f.args[2],
              },
            }),
          });
        })
        // .with({ functionName: 'swap' }, (f) => {
        //   const path = f.args[0][0];

        //   // Figure out the toToken by querying the pool
        //   // TODO: find a better way to do this
        //   const tokenCalls = await this.networks.get(chain).multicall({
        //     contracts: [
        //       {
        //         address: path.steps[0].pool,
        //         abi: SYNCSWAP.poolAbi,
        //         functionName: 'token0',
        //       },
        //       {
        //         address: path.steps[0].pool,
        //         abi: SYNCSWAP.poolAbi,
        //         functionName: 'token1',
        //       },
        //     ],
        //   });

        //   const pair = tokenCalls.map((c) => c.result).filter(Boolean);
        //   if (pair.length !== 2) return;

        //   // ETH can be used as tokenIn, but uses the WETH pool
        //   const fromToken = path.tokenIn;
        //   const toToken =
        //     (isEthToken(fromToken) ? WETH.address[chain] : fromToken) === pair[0]
        //       ? pair[1]
        //       : pair[0];

        //   const [fromAmount, minimumToAmount] = await Promise.all([
        //     this.tokens.asDecimal(asUAddress(fromToken, chain), path.amountIn),
        //     this.tokens.asDecimal(asUAddress(toToken, chain), f.args[1]),
        //   ]);

        //   return Object.assign(new SwapOp(), {
        //     ...base,
        //     fromToken,
        //     fromAmount,
        //     toToken,
        //     minimumToAmount,
        //     deadline: new Date(Number(f.args[2]) * 1000),
        //   } satisfies SwapOp);

        //   logs.push({
        //     address: asAddress(op.to),
        //     ...encodeEvent({
        //       abi: ERC20,
        //       eventName: 'Transfer',
        //       args: {
        //         from: f.args[0],
        //         to: f.args[1],
        //         amount: f.args[2],
        //         minimumToAmount: f.args[3],
        //         deadline: f.args[4],
        //       },
        //     }),
        //   });
        // })
        .with(undefined, () => {})
        .exhaustive();

      // TODO: swap
    }

    return logs;
  }

  private async getValidationErrors(t: TransactionExecutableShape) {
    const errors: string[] = [];

    if (!t.policy.isActive) errors.push('Policy not active');
    if (t.validationErrors.length) errors.push('Policy validation errors');

    const approved = t.policy.threshold <= t.approvals.length;
    if (!approved) errors.push('Insufficient approval');

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

    const sufficientSpending = limitResults.every((r) => r);
    if (!sufficientSpending) errors.push('Greater than allowed spending');

    return errors;
  }

  async bootstrap() {
    const jobs = await this.queue.getJobs(RUNNING_JOB_STATUSES);

    const orphanedTransactions = await this.db.query(
      e.select(e.Transaction, (p) => ({
        filter: and(
          e.op('not', e.op('exists', p.result)),
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

function encodeEvent<
  const abi extends Abi | readonly unknown[],
  eventName extends ContractEventName<abi> | undefined = undefined,
>(parameters: EncodeEventDataParameters<abi, eventName>) {
  return {
    topics: encodeEventTopics(parameters).filter(Boolean) as [Hex, ...Hex[]],
    data: encodeEventData(parameters),
    // eventName: parameters.eventName,
    // args: parameters.args,
    blockHash: null,
    blockNumber: null,
    transactionHash: null,
    transactionIndex: null,
    logIndex: null,
    removed: false,
  } satisfies Partial<Log<undefined, false>>;
}
