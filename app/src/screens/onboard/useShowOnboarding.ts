import { useAccountIds } from '~/queries/account/useAccountIds.api';

export const useShowOnboarding = () => {
  const [accounts] = useAccountIds();
  return accounts.length === 0;
};
