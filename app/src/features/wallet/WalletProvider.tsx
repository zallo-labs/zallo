import { createContext, useContext, useEffect, useState } from 'react';
import * as storage from 'expo-secure-store';
import { Wallet } from 'ethers';

import { PROVIDER } from '~/provider';
import { ChildrenProps } from '@util/provider';
import { CONFIG, IS_DEV } from '~/config';

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
      } else if (IS_DEV && CONFIG.wallet.privateKey) {
        setWallet(new Wallet(CONFIG.wallet.privateKey, PROVIDER));
        setWriteReq(true);
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
