import { useMemo } from 'react';
import { connectFactory } from 'lib';
import { useDevice } from '@features/device/useDevice';
import { PROXY_FACTORY_ADDR } from '~/provider';

export const useAccountProxyFactory = () => {
  const device = useDevice();

  return useMemo(() => connectFactory(PROXY_FACTORY_ADDR, device), [device]);
};
