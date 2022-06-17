import { HARDCODED_TOKENS } from './token';
import { useTokenBalance } from './useTokenBalance';
import { useTokenValue } from './useTokenValue';

export const useTokenBalances = () => {
  const balances = HARDCODED_TOKENS.map((token) => {
    // FIXME: useTokenBalance hook used in loop
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const balance = useTokenBalance(token);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = useTokenValue(token, balance);

    return {
      token,
      balance,
      ...values,
    };
  }).sort((a, b) => b.fiatValue - a.fiatValue);

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
