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
    'zksync-sepolia': '0x92812ac3287B14CdcF8D03C6138d77F61472503d',
    'zksync-goerli': '0x92812ac3287B14CdcF8D03C6138d77F61472503d',
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
    'zksync-sepolia': '0x2E4971D7a2f2b9D90497a21ffE308cE5AbeCb137',
    'zksync-goerli': '0x65680536d53b98a47c21Ca95322EE4a591853Bfa',
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
