import { TOKENS } from './token';
import { useTokenBalance } from './useTokenBalance';

export const useTokenBalances = () => {
  const balances = TOKENS.map((token) => ({
    token,
    // Calling the hook here is safe because TOKENS is constant
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
