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
    'zksync-goerli': '0x262bAb0693Acd75952385622f01a47f7f4e6F819',
  }),
} as const;

export const ACCOUNT_PROXY = {
  abi: accountProxyArtifact.abi,
  bytecode: accountProxyArtifact.bytecode,
};

export const ACCOUNT_PROXY_FACTORY = {
  abi: accountProxyFactoryArtifact.abi,
  address: addresses({
    'zksync-goerli': '0x2CAD009CaB7a3cF23d05d7a4f76E94adFA274022',
  }),
};

export const ACCOUNT_ABI = [
  ...ACCOUNT_IMPLEMENTATION.abi.filter((v) => v.type !== 'constructor'),
  ...ACCOUNT_PROXY.abi,
] as const;

export const PAYMASTER = {
  abi: paymasterArtifact.abi,
  address: addresses({
    'zksync-goerli': '0x5Acd34535900AC749Bc500B991Fb78E6A94677E6',
  }),
};

function addresses(
  m: Partial<Record<Chain, Address>> & Pick<Record<Chain, Address>, 'zksync-goerli'>,
): Record<Chain, Address> {
  return {
    zksync: m.zksync ?? '0x',
    'zksync-goerli': m['zksync-goerli'],
    'zksync-local': m['zksync-local'] ?? m['zksync-goerli'], // Expects a zksync-local node to be forked from zksync-goerli
  };
}
