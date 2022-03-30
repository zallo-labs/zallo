import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as storage from 'expo-secure-store';

import { PROVIDER, Wallet } from '../ethers';

const WalletContext = createContext<Wallet | undefined>(undefined);

export const useWallet = () => useContext(WalletContext)!;

const KEY = 'private-key';

export interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const [writeReq, setWriteReq] = useState(false);

  useEffect(() => {
    (async () => {
      const pk = await storage.getItemAsync(KEY);
      console.log('Read: ' + pk);
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
      console.log('Write: ' + wallet.privateKey);
      setWriteReq(false);
    }
  }, [wallet, writeReq]);

  if (!wallet) return null;

  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
};
