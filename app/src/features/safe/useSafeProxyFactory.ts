import { useMemo } from 'react';
import { connectFactory } from 'lib';
import { useWallet } from '@features/wallet/useWallet';
import { PROXY_FACTORY_ADDR } from '~/provider';

export const useSafeProxyFactory = () => {
  const wallet = useWallet();

  return useMemo(() => connectFactory(PROXY_FACTORY_ADDR, wallet), [wallet]);
};
