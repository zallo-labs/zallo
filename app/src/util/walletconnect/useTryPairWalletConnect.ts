import { CHAIN_ID } from '@network/provider';
import { useCallback } from 'react';
import { showError } from '~/provider/SnackbarProvider';
import { captureException } from '../sentry/sentry';
import { useWalletConnect } from './WalletConnectProvider';

const URI_PATTERN = /^wc:[0-9a-fA-F]{64}@(\d+)/;

const isWalletConnectPairingUri = (uri: string) => {
  const matches = URI_PATTERN.exec(uri);
  if (!matches) return false;

  const chainId = parseFloat(matches[1]);
  // if (chainId !== CHAIN_ID()) {    // TODO: re-enable
  //   showError(`Pairing failed: unsupported chain`);
  //   return false;
  // }

  return true;
};

export const useTryPairWalletConnect = () => {
  const { client } = useWalletConnect();

  return useCallback(
    async (uri: string) => {
      if (!isWalletConnectPairingUri(uri)) return false;

      try {
        await client.pair({ uri }); // Triggers a session_proposal
        return true;
      } catch (e) {
        captureException(e, { extra: { uri } });
        return false;
      }
    },
    [client],
  );
};
