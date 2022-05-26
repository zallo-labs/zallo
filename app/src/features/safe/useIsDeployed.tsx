import { persistAtom } from '@util/persistAtom';
import { Address } from 'lib';
import { atomFamily, useRecoilValue } from 'recoil';
import { PROVIDER } from '~/provider';
import { useSafe } from './SafeProvider';

export const isDeployedState = atomFamily<boolean, Address>({
  key: 'isDeployed',
  default: async (addr) => (await PROVIDER.getCode(addr)) !== '0x',
  effects: [persistAtom()],
});

export const useIsDeployed = (addr?: Address) => {
  const { safe } = useSafe();

  return useRecoilValue(isDeployedState(addr ?? safe.address));
};
