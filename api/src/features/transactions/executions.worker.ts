import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import {
  UUID,
  asAddress,
  asApproval,
  asHex,
  asSystemTransaction,
  asUAddress,
  encodePaymasterInput,
  encodeTransactionSignature,
  isPresent,
  mapAsync,
} from 'lib';
import { DatabaseService } from '~/features/database/database.service';
import { ProposalsService } from '~/features/proposals/proposals.service';
import { NetworksService } from '~/features/util/networks/networks.service';
import e from '~/edgeql-js';
import { policyStateAsPolicy, PolicyShape } from '~/features/policies/policies.util';
import { TX_SHAPE, transactionAsTx } from './transactions.util';
import { ProposalEvent } from '~/features/proposals/proposals.input';
import { selectTransaction } from '~/features/transactions/transactions.service';
import { QueueReturnType, TypedJob, Worker, createQueue } from '~/features/util/bull/bull.util';
import { UnrecoverableError } from 'bullmq';
import { fromPromise } from 'neverthrow';
import { TransactionExecutionErrorType } from 'viem';
import { utils as zkUtils } from 'zksync-ethers';
import { TokensService } from '#/tokens/tokens.service';
import { PricesService } from '#/prices/prices.service';
import Decimal from 'decimal.js';

export const ExecutionsQueue = createQueue<{ transaction: UUID; ignoreSimulation?: boolean }>(
  'Executions',
);
export type ExecutionsQueue = typeof ExecutionsQueue;

@Injectable()
@Processor(ExecutionsQueue.name)
export class ExecutionsWorker extends Worker<ExecutionsQueue> {
  constructor(
    private networks: NetworksService,
    private db: DatabaseService,
    private proposals: ProposalsService,
    private tokens: TokensService,
    private prices: PricesService,
  ) {
    super();
  }

  async process(job: TypedJob<ExecutionsQueue>): Promise<QueueReturnType<ExecutionsQueue>> {
    const { transaction: id, ignoreSimulation } = job.data;
    const proposal = await this.db.query(
      e.select(e.Transaction, () => ({
        filter_single: { id },
        id: true,
        account: { address: true },
        hash: true,
        ...TX_SHAPE,
        status: true,
        executable: true,
        feeToken: { address: true },
        paymaster: true,
        maxAmount: true,
        paymasterEthFees: { total: true },
        approvals: (a) => ({
          filter: e.op('not', a.invalid),
          approver: { address: true },
          signature: true,
        }),
        policy: PolicyShape,
        simulation: {
          success: true,
          timestamp: true,
        },
      })),
    );
    if (!proposal) return 'proposal not found';
    if (proposal.status !== 'Pending' && proposal.status !== 'Executing')
      return `Can't execute transaction with status ${proposal.status}`;

    if (!ignoreSimulation && !proposal.simulation?.success) return 'simulation failed';
    if (!proposal.executable) return 'not executable';

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
    ).filter(isPresent);
    if (approvals.length !== proposal.approvals.length)
      throw new UnrecoverableError('Approval expired'); // TODO: handle expiring approvals

    const feeToken = asUAddress(proposal.feeToken.address);
    const [maxFeePerGas, feeTokenPrice] = await Promise.all([
      network.estimatedMaxFeePerGas(),
      this.prices.price(asUAddress(feeToken, network.chain.key)),
    ]);
    const totalEthFees = maxFeePerGas
      .mul(proposal.gasLimit.toString())
      .plus(proposal.paymasterEthFees.total);
    const amount = await this.tokens.asFp(feeToken, totalEthFees.mul(feeTokenPrice.eth));
    const maxAmount = await this.tokens.asFp(feeToken, new Decimal(proposal.maxAmount));
    if (amount > maxAmount) throw new Error('Amount > maxAmount'); // TODO: handle

    const tx = transactionAsTx(proposal);
    const execution = await fromPromise(
      network.sendTransaction({
        ...asSystemTransaction({ tx }),
        account: asAddress(account),
        customSignature: encodeTransactionSignature({
          tx,
          policy: policyStateAsPolicy(proposal.policy),
          approvals,
        }),
        gasPerPubdata: BigInt(zkUtils.DEFAULT_GAS_PER_PUBDATA_LIMIT),
        paymaster: asAddress(proposal.paymaster),
        paymasterInput: encodePaymasterInput({
          token: asAddress(feeToken),
          amount,
          maxAmount,
        }),
      }),
      (e) => e as TransactionExecutionErrorType,
    );

    this.db.afterTransaction(() =>
      this.proposals.publish({ id, account }, ProposalEvent.submitted),
    );

    if (execution.isOk()) {
      const hash = execution.value;
      await this.db.query(
        e.insert(e.SystemTx, {
          hash,
          proposal: selectTransaction(id),
          maxEthFeePerGas: maxFeePerGas.toString(),
          ethPerFeeToken: feeTokenPrice.eth.toString(),
          usdPerFeeToken: feeTokenPrice.usd.toString(),
        }),
      );

      return hash;
    } /* execution isErr */ else {
      // Validation failed
      await this.db.query(
        e.insert(e.Failed, {
          transaction: selectTransaction(id),
          block: network.blockNumber(),
          gasUsed: 0n,
          ethFeePerGas: maxFeePerGas.toString(),
          reason: execution.error.message,
        }),
      );

      return execution.error;
    }
  }
}
