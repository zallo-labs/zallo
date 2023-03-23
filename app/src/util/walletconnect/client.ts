import '@walletconnect/react-native-compat'; // CRITICAL to import first
import { SignClient } from '@walletconnect/sign-client';
import { CONFIG } from '../config';
import { proxy, useSnapshot } from 'valtio';

const URI_PATTERN = /^wc:[0-9a-f]{64}@2\?/;
export const isWalletConnectUri = (uri: string) => URI_PATTERN.test(uri);

const WALLET_CONNECT = proxy(
  SignClient.init({
    projectId: CONFIG.walletConnectProjectId,
    metadata: {
      name: 'Zallo',
      description: 'Smart wallet',
      url: CONFIG.app.site,
      icons: [CONFIG.app.iconUri],
    },
  }),
);

export const useWalletConnect = () => useSnapshot(WALLET_CONNECT);
