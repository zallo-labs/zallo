import { Address } from 'lib';
import { selectorFamily, useRecoilValue } from 'recoil';
import { Token } from './token';
import { tokensSelector } from './useToken';
import { tokenBalanceAtom } from './useTokenBalance';
import { tokenValueSelector } from './useTokenValue';

const tokensWithBalanceByValueSelector = selectorFamily<Token[], Address | null>({
  key: 'TokensByValue',
  get:
    (account) =>
    ({ get }) => {
      return get(tokensSelector)
        .map((token) => {
          const balance = get(tokenBalanceAtom([account, token.address]));

          return { token, value: get(tokenValueSelector([token.address, balance.toString()])) };
        })
        .filter(({ value }) => value)
        .sort((a, b) => b.value - a.value)
        .map(({ token }) => token);
    },
});

export const useTokensWithBalanceByValue = (address: Address | undefined) =>
  useRecoilValue(tokensWithBalanceByValueSelector(address ?? null));
