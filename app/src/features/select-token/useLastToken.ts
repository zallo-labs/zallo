import { persistAtom } from '@util/effect/persistAtom';
import { Address } from 'lib';
import { atom, selector, useRecoilValue, useSetRecoilState } from 'recoil';
import { USDC } from '~/token/tokens';
import { tokenSelector } from '~/token/useToken';

const lastTokenAddressState = atom<Address>({
  key: 'lastTokenAddress',
  default: USDC.addr,
  effects: [persistAtom()],
});

const lastTokenSelector = selector({
  key: 'lastToken',
  get: ({ get }) => {
    const addr = get(lastTokenAddressState);
    return get(tokenSelector(addr));
  },
});

export const useLastToken = () => useRecoilValue(lastTokenSelector);

export const useSetLastToken = () => useSetRecoilState(lastTokenAddressState);
