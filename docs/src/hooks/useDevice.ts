import { atom, selectorFamily, useRecoilValue } from 'recoil';
import { useCustomFields } from './useCustomFields';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { Wallet as WalletType } from 'ethers';

const { Wallet } = ExecutionEnvironment.canUseDOM ? require('ethers') : ({} as any);

const DEVICE = atom<WalletType>({
  key: 'device',
  default: ExecutionEnvironment.canUseDOM ? Wallet.createRandom() : undefined,
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
