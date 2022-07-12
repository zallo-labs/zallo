import { persistAtom } from '@util/effect/persistAtom';
import { refreshAtom } from '@util/effect/refreshAtom';
import { Address } from 'lib';
import { atomFamily, useRecoilValue } from 'recoil';
import { PROVIDER } from '~/provider';
import { useSafe } from './SafeProvider';

const fetch = async (addr: Address) => (await PROVIDER.getCode(addr)) !== '0x';

export const isDeployedState = atomFamily<boolean, Address>({
  key: 'isDeployed',
  default: fetch,
  effects: (addr) => [
    persistAtom(),
    refreshAtom({
      fetch: () => fetch(addr),
      interval: 30 * 1000,
      // Contract can't become undeployed, so only refresh if it's undeployed
      cancelIf: (v) => v === true,
    }),
  ],
});

export const useIsDeployed = (addr?: Address) => {
  const { safe } = useSafe();

  return useRecoilValue(isDeployedState(addr ?? safe.address));
};
