import { Unimplemented } from '~/util/error/unimplemented';
import { Address } from 'lib';
import { atom, atomFamily, selectorFamily, DefaultValue, useRecoilValue, selector } from 'recoil';
import { Token } from './token';
import { ETH, HARDCODED_TOKENS } from './tokens';
import _ from 'lodash';

export const tokenAddressesAtom = atom<Address[]>({
  key: 'TokenAddresses',
  default: [...HARDCODED_TOKENS.keys()],
});

const tokenMetadataAtom = atomFamily<Token, Address>({
  key: 'TokenMetadata',
  default: (addr: Address) => {
    const token = HARDCODED_TOKENS.get(addr);
    if (!token) {
      // TODO: implement dynamic tokens
      throw new Unimplemented(`dynamic tokens; ${addr}`);
    }

    return token;
  },
});

export const tokenAtom = selectorFamily<Token, Address>({
  key: 'token',
  get:
    (
      addr: Address | DefaultValue, // For some reason `addr` is randomly DefaultValue
    ) =>
    ({ get }) =>
      get(tokenMetadataAtom(addr instanceof DefaultValue ? ETH.address : addr)),
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
  useRecoilValue(tokenAtom(typeof token === 'string' ? token : token.address));

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
