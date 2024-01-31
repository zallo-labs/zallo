import { Address } from '../address';
import { Chain } from 'chains';

export function addressMap<M extends Partial<Record<Chain, Address>>>(m: M) {
  return {
    zksync: m.zksync,
    'zksync-sepolia': m['zksync-sepolia'],
    'zksync-goerli': m['zksync-goerli'],
    'zksync-local': m['zksync-local'] ?? m['zksync-sepolia'], // Expects a zksync-local to be a fork
  } as M &
    Partial<Record<Chain, Address>> &
    (M extends Record<'zksync-local', unknown>
      ? Record<'zksync-local', M['zksync-local']>
      : M extends Record<'zksync-sepolia', unknown>
        ? Record<'zksync-local', M['zksync-sepolia']>
        : Record<string, never>);
}
