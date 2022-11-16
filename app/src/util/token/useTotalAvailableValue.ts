import { UserConfig } from 'lib';
import { CombinedUser } from '~/queries/user/useUser.api';
import { useTotalBalanceValue } from './useTotalBalanceValue';

export const useTotalAvailableValue = (user: CombinedUser, config?: UserConfig) => {
  // TODO: implement

  // Placeholder value until implemented
  return useTotalBalanceValue(user.account);
};
