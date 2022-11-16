import { Address } from 'lib';
import { selectorFamily, useRecoilValue } from 'recoil';
import { TOKEN_BALANCES } from './useTokenBalance';
import { TOKEN_VALUE } from './useTokenValue';

const TOTAL_BALANCE_VALUE = selectorFamily<number, Address | null>({
  key: 'totalBalanceValue',
  get:
    (addr) =>
    ({ get }) => {
      if (!addr) return 0;

      const balances = get(TOKEN_BALANCES(addr));

      return balances.reduce(
        (sum, { balance, token }) => sum + get(TOKEN_VALUE([token.addr, balance])),
        0,
      );
    },
});

export const useTotalBalanceValue = (addr?: Address) =>
  useRecoilValue(TOTAL_BALANCE_VALUE(addr ?? null));
