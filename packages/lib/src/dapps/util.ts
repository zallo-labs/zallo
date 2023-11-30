import { Address } from '../address';
import { Chain } from 'chains';

export function addressMap(
  m: Partial<Record<Chain, Address>> & Pick<Record<Chain, Address>, 'zksync-goerli'>,
): Record<Chain, Address> {
  return {
    zksync: m.zksync ?? '0x',
    'zksync-goerli': m['zksync-goerli'],
    'zksync-local': m['zksync-local'] ?? m['zksync-goerli'], // Expects a zksync-local node to be forked from zksync-goerli
  };
}
