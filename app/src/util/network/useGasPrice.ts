import { refreshAtom } from '~/util/effect/refreshAtom';
import { Address } from 'lib';
import { atom, selector, useRecoilValue } from 'recoil';
import { PROVIDER } from '~/util/network/provider';
import { feeTokenAddr } from '~/components/token/useFeeToken';

const fetch = async (feeToken: Address) => {
  try {
    return (await PROVIDER.getGasPrice(feeToken)).toBigInt();
  } catch {
    console.warn(`Failed to fetch gas price for ${feeToken}`);
    return 0n;
  }
};

const gasPriceAtom = atom<bigint>({
  key: 'GasPrice',
  default: selector({
    key: 'GasPriceDefault',
    get: ({ get }) => fetch(get(feeTokenAddr)),
  }),
  effects: [
    refreshAtom({
      refresh: async ({ get }) => fetch(await get(feeTokenAddr)),
      interval: 5 * 1000,
    }),
  ],
});

export const useGasPrice = () => useRecoilValue(gasPriceAtom);
