import { Address } from './address';
import { Chain } from 'chains';
import * as accountArtifact from './abi/Account';
import * as accountProxyArtifact from './abi/AccountProxy';
import * as deployerArtifact from './abi/Deployer';
import * as paymasterArtifact from './abi/Paymaster';
import * as exposedArtifact from './abi/Expose';

export const EXPOSED_ABI = exposedArtifact.abi;

export const ACCOUNT_IMPLEMENTATION = {
  address: addresses({
    'zksync-sepolia': '0x1422336652eDFD915237bC6F40160FAccA993FEA',
  }),
} as const;

export const ACCOUNT_PROXY = {
  abi: accountProxyArtifact.abi,
  bytecode: accountProxyArtifact.bytecode,
  factoryDeps: accountProxyArtifact.factoryDeps,
};

export const ACCOUNT_ABI = [
  ...accountArtifact.abi.filter((v) => v.type !== 'constructor'),
  ...ACCOUNT_PROXY.abi,
] as const;

export const PAYMASTER = {
  abi: paymasterArtifact.abi,
  address: addresses({
    // Addresses may differ due to different chain configurations
    'zksync-sepolia': '0xAf722c55dE9c3C1933631d73A8D2801f79C2Fe26',
  }),
};

export const DEPLOYER = {
  abi: deployerArtifact.abi,
  address: addresses({
    'zksync-sepolia': '0x51ed28f82dD91CcaC612C7402672Bf9F0EB16444',
  }),
};

export const UPGRADE_APPROVER = addresses({
  'zksync-sepolia': '0x70fa585aFdbe80Ad4619bcCec17B86d31f017a23',
});

function addresses(
  m: Partial<Record<Chain, Address>> & Pick<Record<Chain, Address>, 'zksync-sepolia'>,
): Record<Chain, Address> {
  return {
    zksync: m.zksync ?? '0x',
    'zksync-sepolia': m['zksync-sepolia'],
    'zksync-local': m['zksync-local'] ?? m['zksync-sepolia'], // Expects zksync-local to be a fork
  };
}
