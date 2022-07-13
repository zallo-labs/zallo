import { useMemo } from 'react';
import { getFactory } from 'lib';
import { CONFIG } from '~/config';
import { useWallet } from '@features/wallet/useWallet';

export const useSafeFactory = () => {
  const wallet = useWallet();

  return useMemo(() => getFactory(CONFIG.factoryAddress!, wallet), [wallet]);
};
