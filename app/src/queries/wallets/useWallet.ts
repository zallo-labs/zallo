import { useMemo } from 'react';
import { WalletId } from '.';
import { useWallets } from './useWallets';

export const useWallet = (id: WalletId) => {
  const { wallets } = useWallets();

  return useMemo(
    () =>
      wallets.find(
        (acc) => acc.accountAddr === id.accountAddr && acc.ref === id.ref,
      )!,
    [wallets, id],
  );
};
