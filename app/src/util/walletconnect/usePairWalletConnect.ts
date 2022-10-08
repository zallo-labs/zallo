import { useCallback } from 'react';
import { captureException } from '../sentry/sentry';
import { WALLET_CONNECT_VERSION } from './signClient';
import { useWalletConnect } from './WalletConnectProvider';

const URI_PATTERN = new RegExp(
  `^wc:[0-9a-fA-F]{64}@${WALLET_CONNECT_VERSION}\\?`,
);

export const isWalletConnectPairingUri = (uri: string) => !!URI_PATTERN.exec(uri);

export const usePairWalletConnect = () => {
  const { withClient } = useWalletConnect();

  return useCallback(
    async (uri: string) => {
      if (!isWalletConnectPairingUri(uri)) return false;

      try {
        // Note. Pairing triggers a session_proposal
        await withClient((client) => client.pair({ uri }));
        return true;
      } catch (e) {
        captureException(e, { extra: { uri } });
        return false;
      }
    },
    [withClient],
  );
};
