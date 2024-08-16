import { Processor } from '@nestjs/bullmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  Address,
  UAddress,
  UUID,
  asAddress,
  asApproval,
  asFp,
  asHex,
  asScheduledSystemTransaction,
  asSystemTransaction,
  asUAddress,
  asUUID,
  encodePaymasterInput,
  encodeTransactionSignature,
  mapAsync,
} from 'lib';
import { DatabaseService } from '~/core/database';
import { ProposalsService } from '~/feat/proposals/proposals.service';
import { NetworksService, SendAccountTransactionParams } from '~/core/networks';
import e, { $infer } from '~/edgeql-js';
import { policyStateAsPolicy, PolicyShape } from '~/feat/policies/policies.util';
import { TX_SHAPE, transactionAsTx } from './transactions.util';
import { ProposalEvent } from '~/feat/proposals/proposals.input';
import { QueueReturnType, TypedJob, createQueue } from '~/core/bull/bull.util';
import { Worker } from '~/core/bull/Worker';
import { UnrecoverableError } from 'bullmq';
import { TokensService } from '~/feat/tokens/tokens.service';
import { PricesService } from '~/feat/prices/prices.service';
import Decimal from 'decimal.js';
import { ETH } from 'lib/dapps';
import { Shape } from '~/core/database';
import { match } from 'ts-pattern';
import { PaymasterFeeParts } from '~/feat/paymasters/paymasters.model';
import { PaymastersService } from '~/feat/paymasters/paymasters.service';
import { lowerOfPaymasterFees, paymasterFeesEq } from '~/feat/paymasters/paymasters.util';
import { updatePaymasterFees } from './update-paymaster-fees.query';
import { EventsService, Log } from '../events/events.service';
import { AbiEvent } from 'viem';
import { $SimulatedSuccess } from '~/edgeql-js/modules/default';
import { TransactionsService } from './transactions.service';
import { insertExecution } from './insert-execution.query';

export const ExecutionsQueue = createQueue<ExecutionJob>('Executions');
export type ExecutionsQueue = typeof ExecutionsQueue;
interface ExecutionJob {
  type: 'standard' | 'scheduled';
  transaction: UUID;
  ignoreSimulation?: boolean;
}

const ALLOWED_PRICE_SLIPPAGE = new Decimal('1.001'); // 0.1%

@Injectable()
@Processor(ExecutionsQueue.name, { autorun: false })
export class ExecutionsWorker extends Worker<ExecutionsQueue> {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private events: EventsService,
    private proposals: ProposalsService,
    private tokens: TokensService,
    private prices: PricesService,
    private paymasters: PaymastersService,
    @Inject(forwardRef(() => TransactionsService))
    private transactions: TransactionsService,
  ) {
    super();
  }

  async process(job: TypedJob<ExecutionsQueue>): Promise<QueueReturnType<ExecutionsQueue>> {
    return await match(job.data)
      .with({ type: 'standard' }, (data) => this.processStandard(data))
      .with({ type: 'scheduled' }, (data) => this.processScheduled(data))
      .exhaustive();
  }

  private async processStandard({ transaction: id, ignoreSimulation }: ExecutionJob) {
    const proposal = await this.db.queryWith2({ id: e.uuid }, { id: id }, ({ id }) =>
      e.select(e.Transaction, () => ({
        filter_single: { id },
        hash: true,
        status: true,
        approvals: (a) => ({
          filter: e.op('not', a.invalid),
          approver: { address: true },
          signature: true,
        }),
        policy: PolicyShape,
        paymasterEthFees: { activation: true },
        ...TX_SHAPE,
        ...EXECUTE_TX_SHAPE,
      })),
    );
    if (!proposal) return 'Not found';
    if (proposal.status !== 'Pending')
      return `Can't execute transaction with status ${proposal.status}`;

    const account = asUAddress(proposal.account.address);
    const network = this.networks.get(account);

    const approvals = (
      await mapAsync(proposal.approvals, (a) =>
        asApproval({
          network,
          hash: asHex(proposal.hash),
          approver: asAddress(a.approver.address),
          signature: asHex(a.signature),
        }),
      )
    ).filter(Boolean);
    if (approvals.length !== proposal.approvals.length)
      throw new UnrecoverableError('Approval expired'); // TODO: handle expiring approvals

    const newPaymasterFees = await this.getAndUpdateNewPaymasterFees(id, account, {
      activation: new Decimal(proposal.paymasterEthFees.activation),
    });

    const tx = transactionAsTx(proposal);
    return await this.execute({
      proposal,
      paymasterEthFees: newPaymasterFees,
      ignoreSimulation,
      executeParams: {
        customSignature: encodeTransactionSignature({
          tx,
          policy: policyStateAsPolicy(proposal.policy),
          approvals,
        }),
        ...asSystemTransaction({ tx }),
      },
    });
  }

  private async processScheduled({ transaction: id, ignoreSimulation }: ExecutionJob) {
    const proposal = await this.db.queryWith2({ id: e.uuid }, { id }, ({ id }) =>
      e.select(e.Transaction, () => ({
        filter_single: { id },
        hash: true,
        status: true,
        ...TX_SHAPE,
        ...EXECUTE_TX_SHAPE,
      })),
    );
    if (!proposal) return 'Not found';
    if (proposal.status !== 'Scheduled') return 'Not scheduled';

    return await this.execute({
      proposal,
      paymasterEthFees: undefined,
      ignoreSimulation,
      executeParams: {
        ...asScheduledSystemTransaction({ tx: transactionAsTx(proposal) }),
      },
    });
  }

  private async execute({
    proposal: t,
    executeParams,
    paymasterEthFees,
    ignoreSimulation,
  }: ExecuteParams) {
    if (!t.executable) return 'Not executable';
    if (t.result?.__type__.name !== $SimulatedSuccess.__name__ && !ignoreSimulation)
      return 'Must be a simulated success';

    const account = asUAddress(t.account.address);
    const network = this.networks.get(account);
    const feeToken = asUAddress(t.feeToken.address);

    const [fees, feeTokenPrice] = await Promise.all([
      this.transactions.fees({
        account,
        feeToken: asAddress(t.feeToken.address),
        paymasterEthFees: paymasterEthFees ?? { activation: new Decimal(0) },
        gasLimit: t.gasLimit,
      }),
      this.prices.price(feeToken),
    ]);

    const [maxAmount, amount] = await Promise.all([
      this.tokens.asFp(feeToken, new Decimal(t.maxAmount)),
      this.tokens.asFp(feeToken, fees.feeToken.total.mul(ALLOWED_PRICE_SLIPPAGE)),
    ]);
    if (amount > maxAmount) throw new Error('Amount > maxAmount'); // TODO: SubmissionFailure (or force re-simulation?)

    await this.prices.updatePriceFeedsIfNecessary(network.chain.key, [
      ETH.pythUsdPriceId,
      asHex(t.feeToken.pythUsdPriceId!),
    ]);

    const paymaster = asAddress(t.paymaster);
    const paymasterInput = encodePaymasterInput({
      token: asAddress(feeToken),
      amount,
      maxAmount,
    });

    const timestamp = new Date();
    const txRespResult = await network.sendAccountTransaction({
      from: asAddress(account),
      paymaster,
      paymasterInput,
      maxFeePerGas: asFp(fees.eth.maxFeePerGas, ETH),
      maxPriorityFeePerGas: asFp(fees.eth.maxPriorityFeePerGas, ETH),
      gasPerPubdata: fees.gasPerPubdataLimit,
      ...executeParams,
    });
    if (txRespResult.isErr()) throw txRespResult.error; // TODO: SubmissionFailure (or force re-simulation?)

    const id = asUUID(t.id);
    const resp = txRespResult.value;
    const result = asUUID(
      (
        await this.db.exec(insertExecution, {
          hash: resp.transactionHash,
          proposal: id,
          maxEthFeePerGas: fees.eth.maxFeePerGas.toString(),
          ethPerFeeToken: feeTokenPrice.eth.toString(),
          usdPerFeeToken: feeTokenPrice.usd.toString(),
          gasUsed: (t.result?.gasUsed ?? t.gasLimit).toString(),
          response: t.result?.response ?? '0x',
          timestamp, // Ensures optimistic response originates before confirmation
        })
      ).id,
    );

    // TODO: process events in a separate job to avoid retrying sending of transaction if processing fails
    await this.events.processSimulatedAndOptimistic({
      chain: network.chain.key,
      result,
      logs: resp.events as unknown as Log<AbiEvent, false>[],
    });
    this.proposals.event({ id, account }, ProposalEvent.submitted);

    return resp.transactionHash;
  }

  private async getAndUpdateNewPaymasterFees(
    transaction: UUID,
    account: UAddress,
    existing: PaymasterFeeParts,
  ) {
    const current = await this.paymasters.paymasterFees({ account });
    const lowest = lowerOfPaymasterFees(existing, current);
    if (!paymasterFeesEq(existing, lowest)) {
      this.db.exec(updatePaymasterFees, {
        transaction,
        activation: lowest.activation.toString(),
      });
    }

    return lowest;
  }
}

const EXECUTE_TX_SHAPE = {
  id: true,
  account: { address: true },
  executable: true,
  gasLimit: true,
  feeToken: { address: true, pythUsdPriceId: true },
  paymaster: true,
  maxAmount: true,
  result: {
    __type__: { name: true },
    response: true,
    gasUsed: true,
  },
} satisfies Shape<typeof e.Transaction>;
const s = e.select(e.Transaction, () => EXECUTE_TX_SHAPE);

interface ExecuteParams {
  proposal: NonNullable<$infer<typeof s>>[0];
  executeParams: Omit<
    Partial<SendAccountTransactionParams>,
    'to' | 'paymaster' | 'paymasterInput'
  > & { to: Address };
  paymasterEthFees: PaymasterFeeParts | undefined;
  ignoreSimulation?: boolean;
}
