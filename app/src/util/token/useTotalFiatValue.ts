import { Address } from 'lib';
import { selectorFamily, useRecoilValue } from 'recoil';
import { TOKEN_PRICE_ATOM } from '~/queries/useTokenPrice.uni';
import { tokenBalancesSelector } from './useTokenBalance';
import { toTokenValue } from './useTokenValue';

const totalFiatValue = selectorFamily<number, Address | null>({
  key: 'totalFiatValue',
  get:
    (addr) =>
    ({ get }) => {
      if (!addr) return 0;

      const balances = get(tokenBalancesSelector(addr));

      return balances.reduce((sum, { balance, token }) => {
        const value = get(TOKEN_PRICE_ATOM(token.addresses.mainnet!));
        return sum + toTokenValue(token, balance, value).fiatValue;
      }, 0);
    },
});

export const useTotalFiatValue = (addr?: Address) =>
  useRecoilValue(totalFiatValue(addr ?? null));
