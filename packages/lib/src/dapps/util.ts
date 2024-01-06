import { Address } from '../address';
import { Chain } from 'chains';

export function addressMap<M extends Partial<Record<Chain, Address>>>(m: M) {
  return {
    zksync: m.zksync,
    'zksync-goerli': m['zksync-goerli'],
    'zksync-local': m['zksync-local'] ?? m['zksync-goerli'], // Expects a zksync-local node to be forked from zksync-goerli
  } as M &
    (M extends Record<'zksync-local', unknown>
      ? Record<'zksync-local', M['zksync-local']>
      : M extends Record<'zksync-goerli', unknown>
        ? Record<'zksync-local', M['zksync-goerli']>
        : Partial<Record<Chain, Address>>);
}
