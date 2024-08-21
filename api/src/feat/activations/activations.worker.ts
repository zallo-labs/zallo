import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { TypedJob, QueueReturnType } from '~/core/bull/bull.util';
import { Worker } from '~/core/bull/Worker';
import { NetworksService } from '~/core/networks';
import { ActivationsService } from './activations.service';
import { ActivationsQueue } from './activations.queue';
import { DatabaseService } from '~/core/database';
import e from '~/edgeql-js';
import { selectTransaction2 } from '../transactions/transactions.util';
import { UnrecoverableError } from 'bullmq';
import { asAddress } from 'lib';

@Injectable()
@Processor(ActivationsQueue.name, { autorun: false })
export class ActivationsWorker extends Worker<ActivationsQueue> {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private activations: ActivationsService,
  ) {
    super();
  }

  async process(job: TypedJob<ActivationsQueue>): Promise<QueueReturnType<ActivationsQueue>> {
    const { account, sponsoringTransaction } = job.data;

    const sponsorTxExecutable = await this.db.queryWith(
      { id: e.uuid },
      ({ id }) => selectTransaction2(id).executable,
      { id: sponsoringTransaction },
    );
    if (!sponsorTxExecutable)
      return `Sponsoring transaction is not executable: ${sponsoringTransaction}`;

    // TODO: handle gas limits given `activationFee`. Currently the activation fee may take an additonal transaction to repay
    // const activationFee = new Decimal(sponsorTx.paymasterEthFees.activation);
    // if (!activationFee.isZero()) {
    //   const { maxFeePerGas } = await network.estimatedFeesPerGas();
    //   request['gas'] = asFp(activationFee.div(maxFeePerGas), ETH, Decimal.ROUND_DOWN);
    // }

    const network = this.networks.get(account);
    const request = await this.activations.request(account);
    if (!request) return null;

    const sim = await network.simulateContract(request); // Throws on error
    if (sim.result !== asAddress(account))
      throw new UnrecoverableError(
        `Simulated deployment address ${sim.result} doesn't match expected address ${asAddress(account)}`,
      );

    const { account: _, ...req } = request;
    const receipt = await network.useWallet((wallet) => wallet.writeContract(req));

    return receipt;
  }
}
