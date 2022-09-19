import { useAccountIds } from '~/queries/account/useAccountIds.api';

export const useShowOnboarding = () => useAccountIds()[0].length === 0;
