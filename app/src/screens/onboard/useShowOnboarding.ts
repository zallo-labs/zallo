import { useWallets } from '~/queries/wallets/useWallets';

export const useShowOnboarding = () => useWallets().wallets.length === 0;
