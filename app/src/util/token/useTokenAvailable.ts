import { Token } from './token';
import { useTokenBalance } from './useTokenBalance';
import { AccountIdlike } from '@api/account';

export const useTokenAvailable = (token: Token, AccountIdlike: AccountIdlike) =>
  useTokenBalance(token, AccountIdlike);
