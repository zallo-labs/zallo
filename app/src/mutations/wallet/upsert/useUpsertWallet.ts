import { createUpsertWalletTx } from 'lib';
import { useMemo } from 'react';
import { useProposeTx } from '~/mutations/tx/propose/useProposeTx';
import { useAccount } from '~/queries/account/useAccount';
import { CombinedWallet, toWallet } from '~/queries/wallets';
import { useApiUpsertWallet } from './useUpsertWallet.api';

export const useUpsertWallet = (wallet: CombinedWallet) => {
  const account = useAccount(wallet.accountAddr)?.account;
  const propose = useProposeTx(wallet);
  const apiUpsert = useApiUpsertWallet();

  return useMemo(
    () =>
      account?.contract &&
      (async (cur: CombinedWallet) => {
        return await propose(
          createUpsertWalletTx(account.contract, toWallet(cur)),
          (tx) => apiUpsert(cur, tx.hash),
        );
      }),
    [account?.contract, apiUpsert, propose],
  );
};
