import { createContext, useContext, useEffect, useState } from 'react';
import * as storage from 'expo-secure-store';

import { PROVIDER, Wallet } from '@ethers';
import { ChildrenProps } from '@util/provider';

const WalletContext = createContext<Wallet | undefined>(undefined);

export const useWallet = () => useContext(WalletContext)!;

const KEY = 'private-key';

export const WalletProvider = ({ children }: ChildrenProps) => {
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const [writeReq, setWriteReq] = useState(false);

  useEffect(() => {
    (async () => {
      const pk = await storage.getItemAsync(KEY);
      if (pk) {
        setWallet(new Wallet(pk, PROVIDER));
      } else {
        setWallet(Wallet.createRandom().connect(PROVIDER));
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

  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
};
