import { Address, asAddress } from '../address';
import { Chain } from 'chains';

export function addressMap<M extends Partial<Record<Chain, Address>>>(m: M) {
  return {
    zksync: asAddress(m.zksync),
    'zksync-sepolia': asAddress(m['zksync-sepolia']),
    'zksync-local': asAddress(m['zksync-local']) ?? asAddress(m['zksync-sepolia']), // Expects a zksync-local to be a fork
  } as M &
    Partial<Record<Chain, Address>> &
    (M extends Record<'zksync-local', unknown>
      ? Record<'zksync-local', M['zksync-local']>
      : M extends Record<'zksync-sepolia', unknown>
        ? Record<'zksync-local', M['zksync-sepolia']>
        : Record<string, never>);
}
