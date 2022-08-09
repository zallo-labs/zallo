import { useAccounts } from '~/queries/accounts/useAccounts';

export const useShowOnboarding = () => useAccounts().accounts.length === 0;
