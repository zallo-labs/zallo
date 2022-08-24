import { useRootNavigation } from '~/navigation/useRootNavigation';

export const useGoBack = () => useRootNavigation().goBack;
