import { Address, UserConfig, UserId, ZERO } from 'lib';
import { useUser } from '~/queries/user/useUser.api';
import { Token } from './token';
import { useTokenBalance } from './useTokenBalance';

export const useTokenAvailable = (token: Token, userId: UserId | Address, config?: UserConfig) => {
  const [user] = useUser(userId);
  const balance = useTokenBalance(token, user.account);

  if (!config) config = user.configs.active?.[0];
  const limit = config?.limits[token.addr];
  if (limit?.amount) return limit.amount;

  if (config?.spendingAllowlisted) return ZERO;

  return balance;
};
