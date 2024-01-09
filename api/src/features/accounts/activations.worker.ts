import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Worker, TypedJob, TypedQueue, createQueue } from '~/features/util/bull/bull.util';
import e from '~/edgeql-js';
import { policyStateAsPolicy, policyStateShape } from '~/features/policies/policies.util';
import { NetworksService } from '~/features/util/networks/networks.service';
import { ACCOUNT_PROXY_FACTORY, asAddress, asHex, deployAccountProxy, isPresent } from 'lib';
import { TRANSACTIONS_QUEUE } from '~/features/transactions/transactions.queue';
import { UAddress } from 'lib';

export const ACTIVATIONS_QUEUE = createQueue<ActivationEvent>('Activations');
export interface ActivationEvent {
  account: UAddress;
}

@Injectable()
@Processor(ACTIVATIONS_QUEUE.name)
export class ActivationsWorker extends Worker<typeof ACTIVATIONS_QUEUE> {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    @InjectQueue(TRANSACTIONS_QUEUE.name)
    private transactionsQueue: TypedQueue<typeof TRANSACTIONS_QUEUE>,
  ) {
    super();
  }

  async process(job: TypedJob<typeof ACTIVATIONS_QUEUE>) {
    const { account: address } = job.data;

    const account = await this.db.query(
      e.select(e.Account, (a) => ({
        filter_single: { address },
        isActive: true,
        implementation: true,
        salt: true,
        initPolicies: e.select(a.policies, (p) => ({
          filter: p.draft.isAccountInitState,
          key: true,
          draft: policyStateShape,
        })),
      })),
    );
    if (account?.isActive !== false) return;

    const network = this.networks.get(address);
    const result = await network.useWallet(async (wallet) =>
      deployAccountProxy({
        network,
        wallet,
        factory: ACCOUNT_PROXY_FACTORY.address[network.key],
        implementation: asAddress(account.implementation),
        salt: asHex(account.salt),
        policies: account.initPolicies
          .map((p) => policyStateAsPolicy(p.key, p.draft))
          .filter(isPresent),
      }),
    );
    if (result.isErr()) throw result.error;

    this.transactionsQueue.add('Account activation', {
      chain: network.chain.key,
      transaction: result.value.transactionHash,
    });
  }
}
