import { useCallback } from 'react';
import { useWalletConnectClients } from './WalletConnectProvider';

const URI_PATTERN = /^wc:[0-9a-f]{64}@2\?/;
export const isWalletConnectUriV2 = (uri: string) => !!URI_PATTERN.exec(uri);

export const usePairWalletConnectV2 = () => {
  const { withClient } = useWalletConnectClients();

  return useCallback(
    async (uri: string) => withClient((client) => client.pair({ uri })),
    [withClient],
  );
};
