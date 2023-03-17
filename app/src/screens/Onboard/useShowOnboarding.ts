import { useAccountIds } from '@api/account';

export const useShowOnboarding = () => useAccountIds().length === 0;
