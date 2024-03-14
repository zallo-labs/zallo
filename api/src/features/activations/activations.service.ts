import { Injectable } from '@nestjs/common';
import { ActivationsQueue } from './activations.queue';
import { QueueData } from '../util/bull/bull.util';
import {
  ACCOUNT_PROXY_FACTORY,
  UAddress,
  asAddress,
  asChain,
  asHex,
  deployAccountProxyRequest,
  simulateDeployAccountProxy,
  DeployAccountProxyRequestParams,
  replaceSelfAddress,
  PLACEHOLDER_ACCOUNT_ADDRESS,
} from 'lib';
import { NetworksService } from '../util/networks/networks.service';
import e from '~/edgeql-js';
import { DatabaseService } from '../database/database.service';
import { policyStateAsPolicy, PolicyShape } from '../policies/policies.util';
import { FlowJob } from 'bullmq';
import { ReceiptsQueue } from '../system-txs/receipts.queue';
import Decimal from 'decimal.js';

interface FeeParams {
  address: UAddress;
  feePerGas: Decimal;
  use: boolean;
}

@Injectable()
export class ActivationsService {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
  ) {}

  activationFlow(account: UAddress) {
    return {
      queueName: ReceiptsQueue.name,
      name: 'Activation transaction',
      data: {
        chain: asChain(account),
        transaction: { child: 0 },
      } satisfies QueueData<ReceiptsQueue>,
      children: [
        {
          queueName: ActivationsQueue.name,
          name: 'Activation',
          data: { account } satisfies QueueData<typeof ActivationsQueue>,
        },
      ],
    } satisfies FlowJob;
  }

  async simulate(address: UAddress) {
    const params = await this.params(address);
    if (!params) return null;

    const network = this.networks.get(address);
    return (await simulateDeployAccountProxy({ network, ...params }))._unsafeUnwrap();
  }

  async fee({ address, feePerGas, use }: FeeParams): Promise<Decimal | null> {
    const a = await this.db.query(
      e.select(e.Account, () => ({
        filter_single: { address },
        activationEthFee: true,
      })),
    );
    if (!a) return null;

    if (a.activationEthFee) {
      if (use) {
        await this.db.query(
          e.update(e.Account, () => ({
            filter_single: { address },
            set: { activationEthFee: null },
          })),
        );
      }

      return new Decimal(a.activationEthFee);
    }

    const gas = await this.estimateGas(address);
    return gas ? feePerGas.mul(gas.toString()) : null;
  }

  private async estimateGas(address: UAddress): Promise<bigint | null> {
    const params = await this.params(address);
    if (!params) return null;

    const network = this.networks.get(address);
    try {
      return await network.estimateContractGas({
        account: asAddress(network.walletAddress),
        ...deployAccountProxyRequest(params),
      });
    } catch (e) {
      const isDeployed = !!(await network.getBytecode({ address: asAddress(address) }))?.length;
      if (isDeployed) return 0n;

      throw e;
    }
  }

  async params(address: UAddress) {
    const account = await this.db.query(
      e.select(e.Account, (a) => ({
        filter_single: { address },
        active: true,
        implementation: true,
        salt: true,
        initPolicies: e.select(a.policies, (p) => ({
          filter: p.initState,
          ...PolicyShape,
        })),
      })),
    );
    if (!account) throw new Error(`Account ${address} not found`);
    if (account.active) return null;

    return {
      factory: ACCOUNT_PROXY_FACTORY.address[asChain(address)],
      salt: asHex(account.salt),
      implementation: asAddress(account.implementation),
      policies: account.initPolicies.map((p) =>
        replaceSelfAddress({
          policy: policyStateAsPolicy(p),
          from: asAddress(address),
          to: PLACEHOLDER_ACCOUNT_ADDRESS,
        }),
      ),
    } satisfies DeployAccountProxyRequestParams;
  }
}
