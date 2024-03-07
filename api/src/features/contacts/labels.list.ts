import { CHAINS, Chain } from 'chains';
import { Address, UAddress, asUAddress } from 'lib';

export const getGlobalLabels = (): Record<UAddress, string> => ({
  ...every('0x70fa585aFdbe80Ad4619bcCec17B86d31f017a23', 'Zallo'),
  'zksync:0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295': 'SyncSwap',
  'zksync-goerli:0xB3b7fCbb8Db37bC6f572634299A58f51622A847e': 'SyncSwap',
});

function every(address: Address, label: string) {
  return Object.fromEntries(
    Object.keys(CHAINS).map((chain) => [asUAddress(address, chain as Chain), label] as const),
  );
}
