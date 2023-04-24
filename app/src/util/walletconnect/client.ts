// import '@walletconnect/react-native-compat';
import 'fast-text-encoding';
import { SignClient } from '@walletconnect/sign-client';
import { atom, useAtomValue } from 'jotai';
import { CONFIG } from '../config';

const URI_PATTERN = /^wc:[0-9a-f]{64}@2\?/;
export const isWalletConnectUri = (uri: string) => URI_PATTERN.test(uri);

const WALLET_CONNECT = atom(
  async () =>
    await SignClient.init({
      projectId: CONFIG.walletConnectProjectId,
      metadata: {
        name: 'Zallo',
        description: 'Smart wallet',
        url: CONFIG.metadata.site,
        icons: [CONFIG.metadata.iconUri],
      },
    }),
);

export const useWalletConnect = () => useAtomValue(WALLET_CONNECT);

export type WcClient = ReturnType<typeof useWalletConnect>;
