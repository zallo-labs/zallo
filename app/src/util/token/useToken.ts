import { persistAtom } from '~/util/effect/persistAtom';
import { Unimplemented } from '~/util/error/unimplemented';
import { Address } from 'lib';
import { atom, atomFamily, selectorFamily, DefaultValue, useRecoilValue } from 'recoil';
import { Token } from './token';
import { HARDCODED_TOKENS } from './tokens';

export const TOKEN_ADDRESSES = atom<Address[]>({
  key: 'tokenAddresses',
  default: HARDCODED_TOKENS.map((t) => t.addr),
  effects: [persistAtom()],
});

const TOKEN_STATE = atomFamily<Token, Address>({
  key: 'tokenState',
  default: (addr: Address) => {
    const token = HARDCODED_TOKENS.find((t) => t.addr === addr);
    if (!token) {
      // TODO: implement dynamic tokens
      throw new Unimplemented(`dynamic tokens; ${addr}`);
    }

    return token;
  },
  effects: [persistAtom()],
});

export const TOKEN = selectorFamily<Token, Address>({
  key: 'token',
  get:
    (addr) =>
    ({ get }) =>
      get(TOKEN_STATE(addr)),
  set:
    (addr) =>
    ({ set, reset }, token) => {
      if (token instanceof DefaultValue) {
        reset(TOKEN_ADDRESSES);
        reset(TOKEN_STATE(addr));
      } else {
        set(TOKEN_ADDRESSES, (prev) => (prev.includes(addr) ? prev : [...prev, addr]));
        set(TOKEN_STATE(addr), token);
      }
    },
});

export type Tokenlike = Address | Token;

export const useToken = (token: Tokenlike) =>
  useRecoilValue(TOKEN(typeof token === 'string' ? token : token.addr));

const MAYBE_TOKEN = selectorFamily<Token | null, Address | undefined>({
  key: 'maybeToken',
  get:
    (addr) =>
    ({ get }) => {
      if (!addr) return null;

      return get(TOKEN_ADDRESSES).includes(addr) ? get(TOKEN(addr)) : null;
    },
});

export const useMaybeToken = (addr?: Address) => useRecoilValue(MAYBE_TOKEN(addr));
