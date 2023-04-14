import { Address } from 'lib';
import { atom, selector, useRecoilValue, useSetRecoilState } from 'recoil';
import { Token } from '@token/token';
import { ETH } from '@token/tokens';
import { tokenAtom } from '@token/useToken';
import { persistAtom } from '~/util/effect/persistAtom';

export const feeTokenAddr = atom<Address>({
  key: 'feeTokenAddr',
  default: ETH.address,
  effects: [persistAtom()],
});

const feeToken = selector<Token>({
  key: 'feeToken',
  get: ({ get }) => {
    const addr = get(feeTokenAddr);
    return get(tokenAtom(addr));
  },
  set:
    ({ set }) =>
    (token: Token) => {
      set(feeTokenAddr, token.address);
    },
});

export const useFeeToken = () => useRecoilValue(feeToken);

export const useSetFeeToken = () => useSetRecoilState(feeToken);
