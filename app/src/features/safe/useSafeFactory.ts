import { useMemo } from 'react';
import { Factory__factory } from 'lib';
import { CONFIG } from '~/config';
import { useWallet } from '@features/wallet/useWallet';

export const useSafeFactory = () => {
  const wallet = useWallet();

  return useMemo(
    () => Factory__factory.connect(CONFIG.factoryAddress, wallet),
    [wallet],
  );
};
