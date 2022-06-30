import { useWallet } from '@features/wallet/useWallet';
import { Native } from 'sentry-expo';

export const SentryUser = () => {
  const wallet = useWallet();
  Native.setUser({ id: wallet.address });

  return null;
};
