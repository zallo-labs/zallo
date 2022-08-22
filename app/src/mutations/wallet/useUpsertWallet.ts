import { walletEquiv, createUpsertWalletTx } from 'lib';
import { useMemo } from 'react';
import { useAccount } from '~/queries/account/useAccount';
import { CombinedWallet, toWallet } from '~/queries/wallets';
import { useProposeTx } from '../tx/propose/useProposeTx';
import { useApiUpsertWallet } from './useUpsertWallet.api';

export const useUpsertWallet = (wallet: CombinedWallet) => {
  const account = useAccount(wallet.accountAddr)?.account;
  const propose = useProposeTx(wallet);
  const apiUpsert = useApiUpsertWallet();

  return useMemo(
    () =>
      account?.contract &&
      (async (cur: CombinedWallet, prev?: CombinedWallet) => {
        if (prev && walletEquiv(toWallet(cur), toWallet(prev))) {
          throw new Error('Upserting wallet when cur ≡ prev');
        }

        console.log({
          cur: JSON.stringify(cur),
          curWallet: JSON.stringify(toWallet(cur)),
        })

        return await propose(
          createUpsertWalletTx(account.contract, toWallet(cur)),
          (tx) => apiUpsert(cur, tx.hash),
        );
      }),
    [account?.contract, apiUpsert, propose],
  );
};
