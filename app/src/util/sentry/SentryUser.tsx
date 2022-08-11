import { useDevice } from '@features/device/useDevice';
import { Native } from 'sentry-expo';

export const SentryUser = () => {
  const device = useDevice();
  Native.setUser({ id: device.address });
  console.debug('User', device.address);

  return null;
};
