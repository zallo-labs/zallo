import 'fast-text-encoding';

import { useCallback } from 'react';
import { SignClient } from '@walletconnect/sign-client';
import { atom, useAtom, useAtomValue } from 'jotai';

import { CONFIG } from '../config';

const URI_PATTERN = /^wc:[0-9a-f]{64}@2\?/;
export const isWalletConnectUri = (uri: string) => URI_PATTERN.test(uri);

const WALLET_CONNECT_WATCHER_ATOM = atom({});

const WALLET_CONNECT = atom(
  async () =>
    await SignClient.init({
      projectId: CONFIG.walletConnectProjectId,
      metadata: {
        name: 'Zallo',
        description: 'Smart wallet',
        url: CONFIG.webAppUrl,
        icons: [CONFIG.metadata.iconUri],
      },
    }),
);

export const useWalletConnectWithoutWatching = () => useAtomValue(WALLET_CONNECT);

export const useWalletConnect = () => {
  useAtomValue(WALLET_CONNECT_WATCHER_ATOM); // Causes re-render when updated
  return useAtomValue(WALLET_CONNECT);
};

export const useUpdateWalletConnect = () => {
  const [, set] = useAtom(WALLET_CONNECT_WATCHER_ATOM);

  return useCallback(() => set({}), [set]);
};

export type WcClient = ReturnType<typeof useWalletConnect>;
