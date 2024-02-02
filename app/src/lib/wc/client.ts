import { Core } from '@walletconnect/core';
import { Web3Wallet } from '@walletconnect/web3wallet';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { CONFIG, appLink } from '~/util/config';

const core = new Core({ projectId: CONFIG.walletConnectProjectId });

const CLIENT = atom(
  async () =>
    await Web3Wallet.init({
      core,
      metadata: {
        name: 'Zallo',
        description: 'Smart wallet',
        url: CONFIG.webAppUrl,
        icons: [CONFIG.metadata.iconUri],
        redirect: {
          native: appLink('/wc', 'native'),
          universal: appLink('/wc', 'universal'),
        },
      },
    }),
);

console.log({
  native: appLink('/wc', 'native'),
  universal: appLink('/wc', 'universal'),
});

const WATCHER = atom({});

export const useWalletConnectWithoutWatching = () => useAtomValue(CLIENT);

export const useWalletConnect = () => {
  useAtomValue(WATCHER); // Causes re-render when updated

  return useAtomValue(CLIENT);
};

export const useUpdateWalletConnect = () => {
  const set = useSetAtom(WATCHER);

  return useCallback(() => set({}), [set]);
};

export type WcClient = ReturnType<typeof useWalletConnect>;
