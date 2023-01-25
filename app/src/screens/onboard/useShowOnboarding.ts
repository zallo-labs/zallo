import { useAccountIds } from '~/queries/account/useAccounts.api';

export const useShowOnboarding = () => useAccountIds().length === 0;
