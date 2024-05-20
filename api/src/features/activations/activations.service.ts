import { Injectable } from '@nestjs/common';
import { ActivationsQueue } from './activations.queue';
import { QueueData } from '../util/bull/bull.util';
import {
  DEPLOYER,
  UAddress,
  asAddress,
  asChain,
  asHex,
  deployAccountProxyRequest,
  simulateDeployAccountProxy,
  DeployAccountProxyRequestParams,
  replaceSelfAddress,
  PLACEHOLDER_ACCOUNT_ADDRESS,
  UUID,
} from 'lib';
import { NetworksService } from '../util/networks/networks.service';
import e from '~/edgeql-js';
import { DatabaseService } from '../database/database.service';
import { policyStateAsPolicy, PolicyShape } from '../policies/policies.util';
import { FlowJob } from 'bullmq';
import { ReceiptsQueue } from '../system-txs/receipts.queue';
import Decimal from 'decimal.js';
import { SimulationsQueue } from '../simulations/simulations.worker';

interface FeeParams {
  account: UAddress;
  feePerGas: Decimal;
}

@Injectable()
export class ActivationsService {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
  ) {}

  activationFlow(account: UAddress, sponsoringTransaction: UUID) {
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
          data: { account, sponsoringTransaction } satisfies QueueData<typeof ActivationsQueue>,
          children: [
            {
              queueName: SimulationsQueue.name,
              name: 'Simulate transaction',
              data: { transaction: sponsoringTransaction } satisfies QueueData<SimulationsQueue>,
            },
          ],
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

  async fee({ account, feePerGas }: FeeParams): Promise<Decimal | null> {
    const a = await this.db.query(
      e.select(e.Account, () => ({
        filter_single: { address: account },
        activationEthFee: true,
      })),
    );
    if (a) return a.activationEthFee ? new Decimal(a.activationEthFee) : null;

    const gas = await this.estimateGas(account);
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

  private async params(address: UAddress) {
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
      deployer: DEPLOYER.address[asChain(address)],
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
