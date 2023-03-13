import assert from 'assert';
import { Address, compareBigInt } from 'lib';
import { selectorFamily, useRecoilValue } from 'recoil';
import { TOKEN_PRICE } from '@uniswap/useTokenPrice';
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
          fiatValue:
            (balance * get(TOKEN_PRICE(token.addr)).current) / 10n ** BigInt(token.decimals),
        }))
        .sort((a, b) => compareBigInt(b.fiatValue, a.fiatValue))
        .map(({ token }) => token);
    },
});

export const useTokensByValue = (addr?: Address) => useRecoilValue(TOKENS_BY_VALUE(addr ?? null));
