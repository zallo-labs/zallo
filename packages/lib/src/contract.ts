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
    'zksync-goerli': '0xDaf66323F8b502f086b6336Bd3B461381f200754',
  }),
} as const;

export const ACCOUNT_PROXY = {
  abi: accountProxyArtifact.abi,
  bytecode: accountProxyArtifact.bytecode,
};

export const ACCOUNT_PROXY_FACTORY = {
  abi: accountProxyFactoryArtifact.abi,
  address: addresses({
    'zksync-goerli': '0xA87c3780338459dfcf27ada8db48a2F1D66F99A3',
  }),
};

export const ACCOUNT_ABI = [
  ...ACCOUNT_IMPLEMENTATION.abi.filter((v) => v.type !== 'constructor'),
  ...ACCOUNT_PROXY.abi,
] as const;

export const PAYMASTER = {
  abi: paymasterArtifact.abi,
  address: addresses({
    'zksync-goerli': '0x07E6Fcfd986a3A6fE1BC8802C34d106d9c474581',
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
