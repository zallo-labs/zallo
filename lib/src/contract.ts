import { Address } from './address';
import { Chain } from './chains';
import { Account__factory, AccountProxy__factory, Factory__factory } from './contracts';

export const ACCOUNT = {
  abi: Account__factory.abi,
  implementationAddress: addresses({
    'zksync-goerli': '0xD58c33E390f3B44F5071164A0688eF00Cb8103c4',
  }),
} as const;

export const ACCOUNT_PROXY = { abi: AccountProxy__factory.abi } as const;

export const ACCOUNT_PROXY_FACTORY = {
  abi: Factory__factory.abi,
  address: addresses({
    'zksync-goerli': '0xF9a3E63A53c2182dd29305907fF607509672797d',
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
