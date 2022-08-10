import { useWalletIds } from '~/queries/wallets/useWalletIds';

export const useShowOnboarding = () => useWalletIds().walletIds.length === 0;
