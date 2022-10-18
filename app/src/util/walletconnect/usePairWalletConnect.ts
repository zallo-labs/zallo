import { useCallback } from 'react';
import { showInfo } from '~/provider/SnackbarProvider';
import {
  isWalletConnectUriV1,
  usePairWalletConnectV1,
} from './usePairWalletConnectV1';
import {
  isWalletConnectUriV2,
  usePairWalletConnectV2,
} from './usePairWalletConnectV2';

export const isWalletConnectUri = (uri: string) =>
  isWalletConnectUriV1(uri) || isWalletConnectUriV2(uri);

export const usePairWalletConnect = () => {
  const pairV1 = usePairWalletConnectV1();
  const pairV2 = usePairWalletConnectV2();

  return useCallback(
    async (uri: string) => {
      showInfo('Connecting to DApp. Please wait...');

      return isWalletConnectUriV2(uri) ? pairV2(uri) : pairV1(uri);
    },
    [pairV1, pairV2],
  );
};
