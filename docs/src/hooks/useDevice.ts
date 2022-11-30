import { atom, DefaultValue, selectorFamily, useRecoilValue } from 'recoil';
import { useCustomFields } from './useCustomFields';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { Wallet as WalletType } from 'zksync-web3';
const { Wallet } = ExecutionEnvironment.canUseDOM ? require('zksync-web3') : ({} as any);

const DEVICE = atom<WalletType>({
  key: 'device',
  default: ExecutionEnvironment.canUseDOM ? Wallet.createRandom() : undefined,
  effects: ExecutionEnvironment.canUseDOM
    ? [
        ({ onSet, setSelf, node: { key } }) => {
          onSet((newValue) => {
            localStorage.setItem(key, newValue.privateKey);
          });

          setSelf(
            (async () => {
              const pk = localStorage.getItem(key);
              return pk ? new Wallet(pk) : new DefaultValue();
            })(),
          );
        },
      ]
    : undefined,
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
