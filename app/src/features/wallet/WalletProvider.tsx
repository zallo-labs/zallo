import { createContext, useContext, useEffect, useState } from 'react';
import * as storage from 'expo-secure-store';
import * as zk from 'zksync-web3';

import { ETH_PROVIDER, PROVIDER } from '~/provider';
import { ChildrenProps } from '@util/children';
import { CONFIG, IS_DEV } from '~/config';

const WalletContext = createContext<zk.Wallet | undefined>(undefined);

export const useWallet = () => useContext(WalletContext)!;

const KEY = 'private-key';

export const WalletProvider = ({ children }: ChildrenProps) => {
  const [wallet, setWallet] = useState<zk.Wallet | undefined>(undefined);
  const [writeReq, setWriteReq] = useState(false);

  useEffect(() => {
    (async () => {
      const pk = await storage.getItemAsync(KEY);
      if (pk) {
        setWallet(new zk.Wallet(pk, PROVIDER, ETH_PROVIDER));
      } else if (IS_DEV && CONFIG.wallet.privateKey) {
        setWallet(
          new zk.Wallet(CONFIG.wallet.privateKey, PROVIDER, ETH_PROVIDER),
        );
        setWriteReq(true);
      } else {
        setWallet(
          zk.Wallet.createRandom().connect(PROVIDER).connectToL1(ETH_PROVIDER),
        );
        setWriteReq(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (wallet && writeReq) {
      storage.setItemAsync(KEY, wallet.privateKey);
      setWriteReq(false);
    }
  }, [wallet, writeReq]);

  if (!wallet) return null;

  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  );
};
