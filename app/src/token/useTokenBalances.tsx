import { TOKENS } from './tokens';
import { useTokenBalance } from './useTokenBalance';

export const useTokenBalances = () => {
  const balances = TOKENS.map((token) => ({
    token,
    ...useTokenBalance(token),
  })).sort((a, b) => b.fiatValue - a.fiatValue);

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
