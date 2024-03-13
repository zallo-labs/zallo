import { CHAINS, Chain } from 'chains';
import { Address, UAddress, asUAddress } from 'lib';
import { SYNCSWAP } from 'lib/dapps';

export const GLOBAL_LABELS: Record<UAddress, string> = {
  ...every('0x70fa585aFdbe80Ad4619bcCec17B86d31f017a23', 'Zallo'),
  ...Object.fromEntries(
    Object.entries(SYNCSWAP.router.address).map(
      ([chain, address]) => [asUAddress(address, chain as Chain), 'SyncSwap'] as const,
    ),
  ),
};

function every(address: Address, label: string) {
  return Object.fromEntries(
    Object.keys(CHAINS).map((chain) => [asUAddress(address, chain as Chain), label] as const),
  );
}
