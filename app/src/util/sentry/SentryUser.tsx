import { useDevice } from '@network/useDevice';
import { useEffect } from 'react';
import { Native } from 'sentry-expo';

export const SentryUser = () => {
  const device = useDevice();

  useEffect(() => Native.setUser({ id: device.address }), [device.address]);

  return null;
};
