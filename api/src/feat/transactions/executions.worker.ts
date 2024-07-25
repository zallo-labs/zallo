import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import {
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
import {
  lowerOfPaymasterFees,
  paymasterFeesEq,
  totalPaymasterEthFees,
} from '~/feat/paymasters/paymasters.util';
import { insertSystx } from './insert-systx.query';
import { updatePaymasterFees } from './update-paymaster-fees.query';

export const ExecutionsQueue = createQueue<ExecutionJob>('Executions');
export type ExecutionsQueue = typeof ExecutionsQueue;
interface ExecutionJob {
  type: 'standard' | 'scheduled';
  transaction: UUID;
  ignoreSimulation?: boolean;
}

const PRICE_DRIFT_MULTIPLIER = new Decimal('1.001'); // 0.1%

@Injectable()
@Processor(ExecutionsQueue.name, { autorun: false })
export class ExecutionsWorker extends Worker<ExecutionsQueue> {
  constructor(
    private networks: NetworksService,
    private db: DatabaseService,
    private proposals: ProposalsService,
    private tokens: TokensService,
    private prices: PricesService,
    private paymasters: PaymastersService,
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
    if (proposal.status !== 'Pending' && proposal.status !== 'Executing')
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
      paymasterEthFees: totalPaymasterEthFees(newPaymasterFees),
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
    proposal,
    executeParams,
    paymasterEthFees,
    ignoreSimulation,
  }: ExecuteParams) {
    if (!proposal.simulation?.success && !ignoreSimulation) return 'Simulation failed';
    if (!proposal.executable) return 'Not executable';

    const account = asUAddress(proposal.account.address);
    const network = this.networks.get(account);

    const feeToken = asUAddress(proposal.feeToken.address);
    const [maxFeePerGas, feeTokenPrice] = await Promise.all([
      network.estimatedMaxFeePerGas(),
      this.prices.price(asUAddress(feeToken, network.chain.key)),
    ]);
    const feeTokenPerGas = maxFeePerGas.div(feeTokenPrice.eth).mul(PRICE_DRIFT_MULTIPLIER);
    const totalFeeTokenFees = feeTokenPerGas
      .mul(proposal.gasLimit.toString())
      .plus(paymasterEthFees ?? '0');
    const amount = await this.tokens.asFp(feeToken, totalFeeTokenFees);
    const maxAmount = await this.tokens.asFp(feeToken, new Decimal(proposal.maxAmount));
    if (amount > maxAmount) throw new Error('Amount > maxAmount'); // TODO: add to failed submission result TODO: fail due to insufficient funds -- re-submit for re-simulation (forced)

    await this.prices.updatePriceFeedsIfNecessary(network.chain.key, [
      ETH.pythUsdPriceId,
      asHex(proposal.feeToken.pythUsdPriceId!),
    ]);

    const paymaster = asAddress(proposal.paymaster);
    const paymasterInput = encodePaymasterInput({
      token: asAddress(feeToken),
      amount,
      maxAmount,
    });
    const estimatedFee = await network.estimateFee({
      type: 'eip712',
      account: asAddress(account),
      paymaster,
      paymasterInput,
      ...executeParams,
    });

    // if (executeParams.gas && executeParams.gas < estimatedFee.gasLimit) throw new Error('gas less than estimated gasLimit');

    const execution = await network.sendAccountTransaction({
      from: asAddress(account),
      paymaster,
      paymasterInput,
      maxFeePerGas: asFp(maxFeePerGas, ETH),
      maxPriorityFeePerGas: estimatedFee.maxPriorityFeePerGas,
      gasPerPubdata: estimatedFee.gasPerPubdataLimit, // This should ideally be signed during proposal creation
      ...executeParams,
    });

    if (execution.isErr()) throw execution.error; // Transactions with validation errors should not be marked as executable

    const id = asUUID(proposal.id);
    const r = await (async () => {
      if (execution.isOk()) {
        const hash = execution.value;
        await this.db.exec(insertSystx, {
          hash,
          proposal: id,
          maxEthFeePerGas: maxFeePerGas.toString(),
          ethPerFeeToken: feeTokenPrice.eth.toString(),
          usdPerFeeToken: feeTokenPrice.usd.toString(),
        });

        return hash;
      } /* execution isErr */ else {

        // TODO: adds failed submission result

        // Validation failed
        // const err = execution.error;
        // await this.db.query(
        //   e.insert(e.Failed, {
        //     transaction: selectTransaction(id),
        //     block: network.blockNumber(),
        //     gasUsed: 0n,
        //     ethFeePerGas: maxFeePerGas.toString(),
        //     reason: err.message,
        //   }),
        // );
        // return err;
      }
    })();

    this.proposals.event({ id, account }, ProposalEvent.submitted);

    return r;
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
  simulation: { success: true },
  gasLimit: true,
  feeToken: { address: true, pythUsdPriceId: true },
  paymaster: true,
  maxAmount: true,
} satisfies Shape<typeof e.Transaction>;
const s = e.select(e.Transaction, () => EXECUTE_TX_SHAPE);

interface ExecuteParams {
  proposal: NonNullable<$infer<typeof s>>[0];
  executeParams: Partial<SendAccountTransactionParams>;
  paymasterEthFees: Decimal | undefined;
  ignoreSimulation?: boolean;
}
