import { useTokenBalances } from './useTokenBalance';
import { useTokenValue } from './useTokenValue';

export const useTokenValues = () => {
  const tokenBalances = useTokenBalances();

  const balances = tokenBalances
    .map((tokenWithBalance) => ({
      ...tokenWithBalance,
      // FIX: this is not good... This could be fixed by importing token values into recoil and using a selector
      // eslint-disable-next-line react-hooks/rules-of-hooks
      ...useTokenValue(tokenWithBalance, tokenWithBalance.balance),
    }))
    .sort((a, b) => b.fiatValue - a.fiatValue);

  const totalEthValue = balances.reduce(
    (sum, balance) => sum + balance.ethValue,
    0,
  );
  const totalFiatValue = balances.reduce(
    (sum, balance) => sum + balance.fiatValue,
    0,
  );

  return { balances, totalEthValue, totalFiatValue };
};
