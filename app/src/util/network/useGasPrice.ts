import { refreshAtom } from '~/util/effect/refreshAtom';
import { Address } from 'lib';
import { atom, selector, useRecoilValue } from 'recoil';
import { PROVIDER } from '~/util/network/provider';
import { feeTokenAddr } from '../../components/token/useFeeToken';

const fetch = (feeToken: Address) => PROVIDER.getGasPrice(feeToken);

const gasPrice = atom({
  key: 'gasPrice',
  default: selector({
    key: 'gasPriceDefault',
    get: ({ get }) => fetch(get(feeTokenAddr)),
  }),
  effects: [
    refreshAtom({
      fetch: async ({ get }) => fetch(await get(feeTokenAddr)),
      interval: 5 * 1000,
    }),
  ],
});

export const useGasPrice = () => useRecoilValue(gasPrice);
