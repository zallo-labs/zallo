import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { TypedJob, Worker, createQueue } from '../util/bull/bull.util';
import {
  UUID,
  asAddress,
  asScheduledSystemTransaction,
  asUAddress,
  encodePaymasterInput,
} from 'lib';
import { NetworksService } from '../util/networks/networks.service';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { TX_SHAPE, transactionAsTx } from '../transactions/transactions.util';
import { selectTransaction } from '../transactions/transactions.service';
import { fromPromise } from 'neverthrow';
import { TransactionExecutionErrorType } from 'viem';
import { TokensService } from '#/tokens/tokens.service';
import { utils as zkUtils } from 'zksync-ethers';
import { PricesService } from '#/prices/prices.service';
import Decimal from 'decimal.js';

export const SchedulerQueue = createQueue<{ transaction: UUID }>('Scheduled');
export type SchedulerQueue = typeof SchedulerQueue;

@Injectable()
@Processor(SchedulerQueue.name)
export class SchedulerWorker extends Worker<SchedulerQueue> {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private tokens: TokensService,
    private prices: PricesService,
  ) {
    super();
  }

  async process(job: TypedJob<SchedulerQueue>) {
    const selectedProposal = selectTransaction(job.data.transaction);
    const proposal = await this.db.query(
      e.select(selectedProposal, () => ({
        ...TX_SHAPE,
        account: { address: true },
        status: true,
        simulation: { success: true },
        paymaster: true,
        maxAmount: true,
        paymasterEthFees: { total: true },
      })),
    );
    if (!proposal) return 'Proposal not found';
    if (proposal.status !== 'Scheduled') return 'Not scheduled';
    if (!proposal.simulation) return 'Not simulated';
    if (!proposal.simulation.success) return 'Simulation failed';

    const account = asUAddress(proposal.account.address);
    const network = this.networks.get(account);

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

    const execution = await fromPromise(
      network.sendTransaction({
        ...asScheduledSystemTransaction({ tx: transactionAsTx(proposal) }),
        account: asAddress(account),
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

    if (execution.isErr()) {
      await this.db.query(
        e.insert(e.Failed, {
          transaction: selectedProposal,
          block: network.blockNumber(),
          gasUsed: 0n,
          ethFeePerGas: maxFeePerGas.toString(),
          reason: execution.error.message,
        }),
      );

      return execution.error;
    }

    const hash = execution.value;

    await this.db.query(
      e.insert(e.SystemTx, {
        hash,
        proposal: selectedProposal,
        maxEthFeePerGas: maxFeePerGas.toString(),
        ethPerFeeToken: feeTokenPrice.eth.toString(),
        usdPerFeeToken: feeTokenPrice.usd.toString(),
      }),
    );

    return hash;
  }
}
