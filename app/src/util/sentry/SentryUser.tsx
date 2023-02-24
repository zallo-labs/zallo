import { useCredentials } from '@network/useCredentials';
import { useEffect } from 'react';
import { Native } from 'sentry-expo';

export const SentryUser = () => {
  const credentials = useCredentials();

  useEffect(() => Native.setUser({ id: credentials.address }), [credentials.address]);

  return null;
};
