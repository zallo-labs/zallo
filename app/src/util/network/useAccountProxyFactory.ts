import { useMemo } from 'react';
import { connectFactory } from 'lib';
import { useCredentials } from '@network/useCredentials';
import { PROXY_FACTORY_ADDR } from '~/util/network/provider';

export const useAccountProxyFactory = () => {
  const device = useCredentials();

  return useMemo(() => connectFactory(PROXY_FACTORY_ADDR, device), [device]);
};
