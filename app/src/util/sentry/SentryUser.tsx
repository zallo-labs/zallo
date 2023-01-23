import { useCredentials } from '@network/useCredentials';
import { useEffect } from 'react';
import { Native } from 'sentry-expo';

export const SentryUser = () => {
  const device = useCredentials();

  useEffect(() => Native.setUser({ id: device.address }), [device.address]);

  return null;
};
