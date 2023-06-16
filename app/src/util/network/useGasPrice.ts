import { refreshAtom } from '~/util/effect/refreshAtom';
import { Address } from 'lib';
import { atomFamily, selector, useRecoilValue } from 'recoil';
import { CHAIN, PROVIDER } from '~/util/network/provider';
import { useFeeToken } from '~/components/token/useFeeToken';
import { Token } from '@token/token';
import assert from 'assert';

const fetch = async (token: Address) => {
  assert(CHAIN.testnet); // Mainnet FIXME: get correct gas price
  // On testnet the conversion is 1:1 token:ETH (wei)
  try {
    return (await PROVIDER.getGasPrice()).toBigInt();
  } catch (e) {
    console.warn(`Failed to fetch gas price for ${token}: ${e}`);
    return 0n;
  }
};

const gasPriceAtom = atomFamily<bigint, Address>({
  key: 'GasPrice',
  default: (token) =>
    selector({
      key: 'GasPriceDefault',
      get: () => fetch(token),
    }),
  effects: (token) => [
    refreshAtom({
      refresh: () => fetch(token),
      interval: 5 * 1000,
    }),
  ],
});

export const useGasPrice = (token?: Token) => {
  const feeToken = useFeeToken();
  return useRecoilValue(gasPriceAtom((token || feeToken).address));
};
