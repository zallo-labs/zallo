import { Injectable } from '@nestjs/common';
import { ActivationsQueue } from './activations.queue';
import { QueueData } from '~/core/bull/bull.util';
import {
  DEPLOYER,
  UAddress,
  asAddress,
  asChain,
  asHex,
  replaceSelfAddress,
  PLACEHOLDER_ACCOUNT_ADDRESS,
  UUID,
  ACCOUNT_PROXY,
  encodeProxyConstructorArgs,
} from 'lib';
import { NetworksService } from '~/core/networks/networks.service';
import e from '~/edgeql-js';
import { DatabaseService } from '~/core/database';
import { policyStateAsPolicy, PolicyShape } from '../policies/policies.util';
import { FlowJob } from 'bullmq';
import { ConfirmationQueue } from '../system-txs/confirmations.queue';
import Decimal from 'decimal.js';
import { SimulationsQueue } from '../simulations/simulations.worker';
import { toHex } from 'viem';
import { utils as zkUtils } from 'zksync-ethers';

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

  flow(account: UAddress, sponsoringTransaction: UUID) {
    return {
      queueName: ConfirmationQueue.name,
      name: 'Activation transaction',
      data: {
        chain: asChain(account),
        transaction: { child: 0 },
      } satisfies QueueData<ConfirmationQueue>,
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

  async fee({ account, feePerGas }: FeeParams): Promise<Decimal | null> {
    const a = await this.db.queryWith(
      { address: e.UAddress },
      ({ address }) =>
        e.select(e.Account, () => ({
          filter_single: { address },
          activationEthFee: true,
        })),
      { address: account },
    );
    if (!a) return null;
    if (a.activationEthFee) return new Decimal(a.activationEthFee);

    const request = await this.request(account);
    if (!request) return null;

    const network = this.networks.get(account);
    try {
      const gas = await network.estimateContractGas(request);
      return feePerGas.mul(gas.toString());
    } catch (e) {
      const isDeployed = !!(await network.getCode({ address: asAddress(account) }))?.length;
      if (isDeployed) return null;

      throw e;
    }
  }

  async request(address: UAddress) {
    const account = await this.db.queryWith(
      { address: e.UAddress },
      ({ address }) =>
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
      { address },
    );
    if (!account) throw new Error(`Account ${address} not found`);
    if (account.active) return null;

    const constructorArgs = encodeProxyConstructorArgs({
      implementation: asAddress(account.implementation),
      policies: account.initPolicies.map((p) =>
        replaceSelfAddress({
          policy: policyStateAsPolicy(p),
          from: asAddress(address),
          to: PLACEHOLDER_ACCOUNT_ADDRESS,
        }),
      ),
    });

    const network = this.networks.get(address);
    return {
      account: asAddress(network.walletAddress),
      abi: DEPLOYER.abi,
      address: DEPLOYER.address[asChain(address)],
      functionName: 'create2Account' as const,
      args: [
        asHex(account.salt),
        toHex(zkUtils.hashBytecode(ACCOUNT_PROXY.bytecode)),
        constructorArgs,
        1, // AccountAbstractionVersion.Version1
      ] as const,
      // factoryDeps: [ACCOUNT_PROXY.bytecode], // Throws "rpc method is not whitelisted" if provided; bytecode must be deployed using SystemContractDeployer first
      // gas: 3_000_000n * BigInt(params.policies.length), // ~1M per policy; gas estimation panics if not provided
    } satisfies Parameters<typeof network.simulateContract>[0];
  }
}
