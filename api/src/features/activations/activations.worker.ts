import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { TypedJob, QueueReturnType } from '~/features/util/bull/bull.util';
import { Worker } from '#/util/bull/Worker';
import { NetworksService } from '~/features/util/networks/networks.service';
import { ActivationsService } from './activations.service';
import { ActivationsQueue } from './activations.queue';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';

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

    const sponsorTx = await this.db.query(
      e.select(e.Transaction, () => ({
        filter_single: { id: sponsoringTransaction },
        executable: true,
      })),
    );
    if (!sponsorTx?.executable)
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

    await network.simulateContract(request); // Throws on error

    const { account: _, ...req } = request;
    const receipt = await network.useWallet((wallet) => wallet.writeContract(req));

    return receipt;
  }
}
