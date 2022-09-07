import { Address } from 'lib';
import { selectorFamily, useRecoilValue } from 'recoil';
import { TOKEN_PRICE } from '~/queries/useTokenPrice.uni';
import { TOKEN_BALANCES } from './useTokenBalance';
import { toTokenValue } from './useTokenValue';

const totalFiatValue = selectorFamily<number, Address | null>({
  key: 'totalFiatValue',
  get:
    (addr) =>
    ({ get }) => {
      if (!addr) return 0;

      const balances = get(TOKEN_BALANCES(addr));

      return balances.reduce((sum, { balance, token }) => {
        const value = get(TOKEN_PRICE(token.addr));
        return sum + toTokenValue(token, balance, value).fiatValue;
      }, 0);
    },
});

export const useTotalFiatValue = (addr?: Address) =>
  useRecoilValue(totalFiatValue(addr ?? null));
