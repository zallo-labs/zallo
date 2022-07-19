import { refreshAtom } from '@util/effect/refreshAtom';
import { Address } from 'lib';
import { atom, selector, useRecoilValue } from 'recoil';
import { PROVIDER } from '~/provider';
import { feeTokenAddr } from './useFeeToken';

const fetch = (feeToken: Address) => PROVIDER.getGasPrice(feeToken);

const gasPrice = atom({
  key: 'gasPrice',
  default: selector({
    key: 'gasPriceDefault',
    get: ({ get }) => fetch(get(feeTokenAddr)),
  }),
  effects: [
    refreshAtom({
      fetch,
      fetchParams: [feeTokenAddr],
      interval: 5 * 1000,
    }),
  ],
});

export const useGasPrice = () => useRecoilValue(gasPrice);
