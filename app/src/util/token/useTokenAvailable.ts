import { Address, UserId, ZERO } from 'lib';
import { useUser } from '~/queries/user/useUser.api';
import { Token } from './token';
import { useTokenBalance } from './useTokenBalance';

export const useTokenAvailable = (token: Token, userId: UserId | Address) => {
  const [user] = useUser(userId);
  const balance = useTokenBalance(token, user.account);

  const config = user.configs.active?.[0];
  const limit = config?.limits[token.addr];
  if (limit?.amount) return limit.amount;

  if (config?.spendingAllowlisted) return ZERO;

  return balance;
};
