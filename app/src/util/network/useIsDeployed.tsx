import { persistAtom } from '~/util/effect/persistAtom';
import { refreshAtom } from '~/util/effect/refreshAtom';
import { Address, ZERO_ADDR } from 'lib';
import { atomFamily, useRecoilValue, useSetRecoilState } from 'recoil';
import { PROVIDER } from '~/util/network/provider';

const fetch = async (addr: Address) =>
  addr !== ZERO_ADDR && (await PROVIDER.getCode(addr)) !== '0x';

const isDeployedState = atomFamily<boolean, Address>({
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

export const useIsDeployed = (addr?: Address) =>
  useRecoilValue(isDeployedState(addr ?? ZERO_ADDR));

export const useSetDeployed = (addr: Address) =>
  useSetRecoilState(isDeployedState(addr));
