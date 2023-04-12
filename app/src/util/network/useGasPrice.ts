import { refreshAtom } from '~/util/effect/refreshAtom';
import { Address } from 'lib';
import { atomFamily, selector, useRecoilValue } from 'recoil';
import { PROVIDER } from '~/util/network/provider';
import { useFeeToken } from '~/components/token/useFeeToken';
import { ETH } from '@token/tokens';
import { Token } from '@token/token';

const fetch = async (token: Address) => {
  if (token !== ETH.address)
    throw new Error('Only ETH is curerntly supported -- zk.Provider throws 🤷');
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
