import { persistAtom } from '@util/persistAtom';
import { Address } from 'lib';
import {
  atom,
  atomFamily,
  selectorFamily,
  DefaultValue,
  useRecoilValue,
  selector,
} from 'recoil';
import { HARDCODED_TOKENS, Token } from './token';

const tokenAddressesState = atom<Address[]>({
  key: 'tokenAddresses',
  default: HARDCODED_TOKENS.map((t) => t.addr),
  effects: [persistAtom()],
});

const tokenValueState = atomFamily<Token, Address>({
  key: 'token',
  default: (addr: Address) => {
    const token = HARDCODED_TOKENS.find((t) => t.addr === addr);
    if (token) return token;

    throw new Error(
      'Token not found & dynamic token support is not implemented',
    );
  },
  effects: [persistAtom()],
});

const tokenSelector = selectorFamily<Token, Address>({
  key: 'token-access',
  get:
    (addr) =>
    ({ get }) =>
      get(tokenValueState(addr)),
  set:
    (addr) =>
    ({ set, reset }, token) => {
      if (token instanceof DefaultValue) {
        reset(tokenAddressesState);
        reset(tokenValueState(addr));
      } else {
        set(tokenAddressesState, (prev) =>
          prev.includes(addr) ? prev : [...prev, addr],
        );
        set(tokenValueState(addr), token);
      }
    },
});

const allTokensSelector = selector({
  key: 'allTokens',
  get: ({ get }) => {
    const addresses = get(tokenAddressesState);
    return addresses.map((addr) => get(tokenSelector(addr)));
  },
});

export const useToken = (addr: Address) => useRecoilValue(tokenSelector(addr));

export const useTokens = () => useRecoilValue(allTokensSelector);
