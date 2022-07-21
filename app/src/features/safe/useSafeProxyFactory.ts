import { useMemo } from 'react';
import { connectFactory } from 'lib';
import { CONFIG } from '~/config';
import { useWallet } from '@features/wallet/useWallet';

export const useSafeProxyFactory = () => {
  const wallet = useWallet();

  return useMemo(
    () => connectFactory(CONFIG.proxyFactoryAddress!, wallet),
    [wallet],
  );
};
