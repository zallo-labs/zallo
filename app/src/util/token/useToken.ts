import { persistAtom } from '~/util/effect/persistAtom';
import { Unimplemented } from '~/util/error/unimplemented';
import { Address } from 'lib';
import { atom, atomFamily, selectorFamily, DefaultValue, useRecoilValue, selector } from 'recoil';
import { Token } from './token';
import { HARDCODED_TOKENS } from './tokens';

export const tokenAddressesAtom = atom<Address[]>({
  key: 'TokenAddresses',
  default: HARDCODED_TOKENS.map((t) => t.addr),
  // effects: [persistAtom()],
});

const tokenMetadataAtom = atomFamily<Token, Address>({
  key: 'TokenMetadata',
  default: (addr: Address) => {
    const token = HARDCODED_TOKENS.find((t) => t.addr === addr);
    if (!token) {
      // TODO: implement dynamic tokens
      throw new Unimplemented(`dynamic tokens; ${addr}`);
    }

    return token;
  },
  // effects: [persistAtom()],
});

export const tokenAtom = selectorFamily<Token, Address>({
  key: 'token',
  get:
    (addr) =>
    ({ get }) =>
      get(tokenMetadataAtom(addr)),
  set:
    (addr) =>
    ({ set, reset }, token) => {
      if (token instanceof DefaultValue) {
        reset(tokenAddressesAtom);
        reset(tokenMetadataAtom(addr));
      } else {
        set(tokenAddressesAtom, (prev) => (prev.includes(addr) ? prev : [...prev, addr]));
        set(tokenMetadataAtom(addr), token);
      }
    },
});

export type Tokenlike = Address | Token;

export const useToken = (token: Tokenlike) =>
  useRecoilValue(tokenAtom(typeof token === 'string' ? token : token.addr));

const MAYBE_TOKEN = selectorFamily<Token | null, Address | undefined>({
  key: 'maybeToken',
  get:
    (addr) =>
    ({ get }) => {
      if (!addr) return null;

      return get(tokenAddressesAtom).includes(addr) ? get(tokenAtom(addr)) : null;
    },
});

export const useMaybeToken = (addr?: Address) => useRecoilValue(MAYBE_TOKEN(addr));

export const tokensSelector = selector({
  key: 'Tokens',
  get: ({ get }) => get(tokenAddressesAtom).map((addr) => get(tokenAtom(addr))),
});

export const useTokens = () => useRecoilValue(tokensSelector);
