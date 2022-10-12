import { useCallback } from 'react';
import { usePairWalletConnectV1 } from './usePairWalletConnectV1';
import {
  isWalletConnectV2PairingUri,
  usePairWalletConnectV2,
} from './usePairWalletConnectV2';

const V1_OR_V2_URI_PATTERN = /^wc:[0-9a-fA-F]{64}@(?:1|2)\?/;

export const isWalletConnectPairingUri = (uri: string) =>
  !!V1_OR_V2_URI_PATTERN.exec(uri);

export const usePairWalletConnect = () => {
  const pairV1 = usePairWalletConnectV1();
  const pairV2 = usePairWalletConnectV2();

  return useCallback(
    async (uri: string) =>
      isWalletConnectV2PairingUri(uri) ? pairV2(uri) : pairV1(uri),
    [pairV1, pairV2],
  );
};
