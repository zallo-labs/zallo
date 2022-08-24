import { useMemo } from 'react';
import { connectFactory } from 'lib';
import { useDevice } from '@network/useDevice';
import { PROXY_FACTORY_ADDR } from '~/util/network/provider';

export const useAccountProxyFactory = () => {
  const device = useDevice();

  return useMemo(() => connectFactory(PROXY_FACTORY_ADDR, device), [device]);
};
