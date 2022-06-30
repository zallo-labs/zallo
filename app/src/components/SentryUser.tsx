import { useWallet } from '@features/wallet/useWallet';
import { setUser } from '@sentry/react-native';

export const SentryUser = () => {
  const wallet = useWallet();
  setUser({ id: wallet.address });

  return null;
};
