import { selector, useRecoilValue } from 'recoil';
import { TOKEN, TOKEN_ADDRESSES } from './useToken';

export const TOKENS = selector({
  key: 'tokens',
  get: ({ get }) => {
    const addresses = get(TOKEN_ADDRESSES);
    return addresses.map((addr) => get(TOKEN(addr)));
  },
});

export const useTokens = () => useRecoilValue(TOKENS);
