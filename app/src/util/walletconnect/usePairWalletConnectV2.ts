import { useCallback } from 'react';
import { useWalletConnectClients } from './WalletConnectProvider';

const URI_PATTERN = /^wc:[0-9a-fA-F]{64}@2\?/;

export const isWalletConnectV2PairingUri = (uri: string) =>
  !!URI_PATTERN.exec(uri);

export const usePairWalletConnectV2 = () => {
  const { withClient } = useWalletConnectClients();

  return useCallback(
    async (uri: string) => withClient((client) => client.pair({ uri })),
    [withClient],
  );
};
