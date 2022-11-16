import assert from 'assert';
import { Address, TEN, compareBn } from 'lib';
import { selectorFamily, useRecoilValue } from 'recoil';
import { TOKEN_PRICE } from '~/queries/useTokenPrice.uni';
import { Token } from './token';
import { TOKEN_BALANCES } from './useTokenBalance';

const TOKENS_BY_VALUE = selectorFamily<Token[], Address | null>({
  key: 'tokensByBalance',
  get:
    (addr) =>
    ({ get }) => {
      assert(get(TOKEN_BALANCES(addr)).every((t) => t.token.addr));

      return get(TOKEN_BALANCES(addr))
        .map(({ token, balance }) => ({
          token,
          fiatValue: balance.mul(get(TOKEN_PRICE(token.addr)).current).div(TEN.pow(token.decimals)),
        }))
        .sort((a, b) => compareBn(b.fiatValue, a.fiatValue))
        .map(({ token }) => token);
    },
});

export const useTokensByValue = (addr?: Address) => useRecoilValue(TOKENS_BY_VALUE(addr ?? null));
