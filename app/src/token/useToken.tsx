import { persistAtom } from '@util/effect/persistAtom';
import { Unimplemented } from '@util/error/unimplemented';
import { Address } from 'lib';
import {
  atom,
  atomFamily,
  selectorFamily,
  DefaultValue,
  useRecoilValue,
  selector,
} from 'recoil';
import { Token } from './token';
import { HARDCODED_TOKENS } from './tokens';

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

    // TODO: implement dynamic tokens
    throw new Unimplemented(`dynamic tokens; ${addr}`);
  },
  effects: [persistAtom()],
});

export const tokenSelector = selectorFamily<Token, Address>({
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

export const useToken = (addr: Address) => useRecoilValue(tokenSelector(addr));

export const allTokensSelector = selector({
  key: 'allTokens',
  get: ({ get }) => {
    const addresses = get(tokenAddressesState);
    return addresses.map((addr) => get(tokenSelector(addr)));
  },
});

export const useTokens = () => useRecoilValue(allTokensSelector);

const maybeTokenSelector = selectorFamily<Token | null, Address>({
  key: 'maybeToken',
  get:
    (addr) =>
    ({ get }) =>
      get(tokenAddressesState).includes(addr) ? get(tokenSelector(addr)) : null,
});

export const useMaybeToken = (addr: Address) =>
  useRecoilValue(maybeTokenSelector(addr));
