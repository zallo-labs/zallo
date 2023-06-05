import { atom, DefaultValue, selectorFamily, useRecoilValue } from 'recoil';
import { useCustomFields } from './useCustomFields';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { Approver as ApproverType } from 'lib';
const { Approver } = ExecutionEnvironment.canUseDOM ? require('lib') : ({} as any);

const DEVICE = atom<ApproverType>({
  key: 'device',
  default: ExecutionEnvironment.canUseDOM ? Approver.createRandom() : undefined,
  effects: ExecutionEnvironment.canUseDOM
    ? [
        ({ onSet, setSelf, node: { key } }) => {
          onSet((newValue) => {
            localStorage.setItem(key, newValue.privateKey);
          });

          setSelf(
            (async () => {
              const pk = localStorage.getItem(key);
              return pk ? new Approver(pk) : new DefaultValue();
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
