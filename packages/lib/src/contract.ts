import { Address } from './address';
import { Chain } from 'chains';
import * as accountArtifact from './generated/Account';
import * as accountProxyArtifact from './generated/AccountProxy';
import * as accountProxyFactoryArtifact from './generated/Factory';
import * as testVerifierArtifact from './generated/TestVerifier';
import * as paymasterArtifact from './generated/Paymaster';

export const TEST_VERIFIER_ABI = testVerifierArtifact.abi;

export const ACCOUNT_IMPLEMENTATION = {
  ...accountArtifact,
  address: addresses({
    'zksync-sepolia': '0x64F47f81D8B9Ad0362220601BE5b07BEC60dE3da',
    'zksync-goerli': '0x64F47f81D8B9Ad0362220601BE5b07BEC60dE3da',
  }),
} as const;

export const ACCOUNT_PROXY = {
  abi: accountProxyArtifact.abi,
  bytecode: accountProxyArtifact.bytecode,
};

export const ACCOUNT_PROXY_FACTORY = {
  abi: accountProxyFactoryArtifact.abi,
  address: addresses({
    'zksync-sepolia': '0xF4e2526Be59C3095A8300494CdDE8349Ae019469',
    'zksync-goerli': '0xF4e2526Be59C3095A8300494CdDE8349Ae019469',
  }),
};

export const ACCOUNT_ABI = [
  ...ACCOUNT_IMPLEMENTATION.abi.filter((v) => v.type !== 'constructor'),
  ...ACCOUNT_PROXY.abi,
] as const;

export const PAYMASTER = {
  abi: paymasterArtifact.abi,
  address: addresses({
    // Addresses differ due to token addresses differing on networks
    'zksync-sepolia': '0xcE92aeCa1f4126bdcEAe9cb949ebD895Bd59d51D',
    'zksync-goerli': '0x2CFB10415ce77A026CD6CC40a83349b32d52825A',
  }),
};

function addresses(
  m: Partial<Record<Chain, Address>> &
    Pick<Record<Chain, Address>, 'zksync-sepolia' | 'zksync-goerli'>,
): Record<Chain, Address> {
  return {
    zksync: m.zksync ?? '0x',
    'zksync-sepolia': m['zksync-sepolia'],
    'zksync-goerli': m['zksync-goerli'],
    'zksync-local': m['zksync-local'] ?? m['zksync-sepolia'], // Expects zksync-local to be a fork
  };
}
