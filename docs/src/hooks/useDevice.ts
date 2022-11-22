import { atom, selectorFamily, useRecoilValue } from 'recoil';
import { Wallet } from 'ethers';
import { useCustomFields } from './useCustomFields';

const DEVICE = atom({
  key: 'device',
  default: Wallet.createRandom(),
});

export const useDevice = () => useRecoilValue(DEVICE);

const AUTHORIZATION = selectorFamily<string, string>({
  key: 'authorization',
  get:
    (graphRef) =>
    ({ get }) =>
      get(DEVICE).signMessage(`AUTH ${graphRef}`),
});

export const useAuthorization = () =>
  useRecoilValue(AUTHORIZATION(useCustomFields().apolloGraphRef));
