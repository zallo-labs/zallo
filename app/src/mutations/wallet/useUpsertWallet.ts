import { walletEquiv, createUpsertWalletTx } from 'lib';
import { useCallback } from 'react';
import { useAccount } from '~/queries/account/useAccount';
import { CombinedWallet, toWallet } from '~/queries/wallets';
import { useProposeTx } from '../tx/propose/useProposeTx';

export const useUpsertWallet = (wallet: CombinedWallet) => {
  const account = useAccount(wallet.accountAddr).account!;
  const propose = useProposeTx(wallet);

  return useCallback(
    async (cur: CombinedWallet, prev?: CombinedWallet) => {
      if (prev && walletEquiv(toWallet(cur), toWallet(prev))) {
        throw new Error('Upserting wallet when cur ≡ prev');
      }

      return await propose(
        createUpsertWalletTx(account.contract, toWallet(cur)),
      );
    },
    [account.contract, propose],
  );
};
