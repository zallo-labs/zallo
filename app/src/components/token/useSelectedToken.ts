import { persistAtom } from '~/util/effect/persistAtom';
import { Address } from 'lib';
import { atom, DefaultValue, selector, useRecoilValue, useSetRecoilState } from 'recoil';
import { Token } from '@token/token';
import { ETH } from '@token/tokens';
import { tokenAtom } from '@token/useToken';

const selectedTokenAddressAtom = atom<Address>({
  key: 'SelectedTokenAddress',
  default: ETH.address,
  effects: [persistAtom()],
});

const selectedTokenSelector = selector<Token>({
  key: 'selectedToken',
  get: ({ get }) => {
    const addr = get(selectedTokenAddressAtom);
    return get(tokenAtom(addr));
  },
  set: ({ set }, token) => {
    set(selectedTokenAddressAtom, token instanceof DefaultValue ? token : token.address);
  },
});

export const useSelectedToken = () => useRecoilValue(selectedTokenSelector);

export const useSetSelectedToken = () => useSetRecoilState(selectedTokenSelector);
