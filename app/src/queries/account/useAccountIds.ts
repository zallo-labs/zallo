import { filterFirst } from 'lib';
import { useMemo } from 'react';
import { useWalletIds } from '../wallets/useWalletIds';

export const useAccountIds = () => {
  const { walletIds } = useWalletIds();

  return useMemo(
    () =>
      filterFirst(
        walletIds.map((w) => w.accountAddr),
        (a) => a,
      ),
    [walletIds],
  );
};
