import { CombinedQuorum } from '~/queries/useQuorum.api';
import { useTotalBalanceValue } from './useTotalBalanceValue';

export const useTotalAvailableValue = (quorum: CombinedQuorum) => {
  // TODO: implement

  // Placeholder value until implemented
  return useTotalBalanceValue(quorum.account);
};
