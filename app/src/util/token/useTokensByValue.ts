import { Address } from 'lib';
import { selectorFamily, useRecoilValue } from 'recoil';
import { Token } from './token';
import { tokensSelector } from './useToken';
import { tokenBalanceAtom } from './useTokenBalance';
import { tokenValueSelector } from './useTokenValue';

const tokensByValueSelector = selectorFamily<Token[], Address | null>({
  key: 'TokensByValue',
  get:
    (account) =>
    ({ get }) => {
      return get(tokensSelector)
        .map((token) => {
          const balance = get(tokenBalanceAtom([account, token.addr]));

          return { token, value: get(tokenValueSelector([token.addr, balance.toString()])) };
        })
        .sort((a, b) => b.value - a.value)
        .map(({ token }) => token);
    },
});

export const useTokensByValue = (addr: Address | undefined) =>
  useRecoilValue(tokensByValueSelector(addr ?? null));
