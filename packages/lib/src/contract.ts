import { Address } from './address';
import { Chain } from 'chains';
import accountImplementationAbi from './abi/generated/Account';
import accountProxyAbi from './abi/generated/AccountProxy';
import accountProxyFactoryAbi from './abi/generated/Factory';
export { default as TEST_VERIFIER_ABI } from './abi/generated/TestVerifier';

export const ACCOUNT_IMPLEMENTATION = {
  abi: accountImplementationAbi,
  address: addresses({
    'zksync-goerli': '0xc3380460A7D89981536A9ecA83e289DD0EF0c3D4',
  }),
} as const;

export const ACCOUNT_PROXY = { abi: accountProxyAbi } as const;

export const ACCOUNT_PROXY_FACTORY = {
  abi: accountProxyFactoryAbi,
  address: addresses({
    'zksync-goerli': '0x2f04b94F5a39891C10E666992f08f1a69774b764',
  }),
};

export const ACCOUNT_ABI = [
  ...ACCOUNT_IMPLEMENTATION.abi.filter((v) => v.type !== 'constructor'),
  ...ACCOUNT_PROXY.abi,
] as const;

function addresses(
  m: Partial<Record<Chain, Address>> & Pick<Record<Chain, Address>, 'zksync-goerli'>,
): Record<Chain, Address> {
  return {
    zksync: m.zksync ?? '0x',
    'zksync-goerli': m['zksync-goerli'],
    'zksync-local': m['zksync-local'] ?? m['zksync-goerli'], // Expects a zksync-local node to be forked from zksync-goerli
  };
}
