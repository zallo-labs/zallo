import { useAccountIds } from '~/queries/account/useAccountIds.api';

export const useShowOnboarding = () => useAccountIds().length === 0;
