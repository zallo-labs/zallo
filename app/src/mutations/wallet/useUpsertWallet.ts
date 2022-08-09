import { usePropose } from '@features/execute/ProposeProvider';
import { Wallet, walletEquiv, createUpsertWalletTx } from 'lib';
import { useCallback } from 'react';
import { useSelectedWallet } from '~/components2/wallet/useSelectedWallet';

export const useUpsertWallet = () => {
  const { account } = useSelectedWallet();
  const propose = usePropose();

  const upsert = useCallback(
    async (cur: Wallet, prev?: Wallet) => {
      if (prev && walletEquiv(cur, prev))
        throw new Error('Upserting wallet when cur ≡ prev');

      return await propose(createUpsertWalletTx(account.contract, cur));
    },
    [account.contract, propose],
  );

  return upsert;
};
