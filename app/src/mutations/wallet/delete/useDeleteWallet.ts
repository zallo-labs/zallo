import assert from 'assert';
import { createRemoveGroupTx } from 'lib';
import { useCallback } from 'react';
import { useProposeTx } from '~/mutations/tx/propose/useProposeTx';
import { useAccount } from '~/queries/account/useAccount';
import { CombinedWallet, toWallet } from '~/queries/wallets';
import { useApiDeleteWallet } from './useDeleteWallet.api';

export const useDeleteWallet = (wallet: CombinedWallet) => {
  const account = useAccount(wallet.accountAddr).account;
  const propose = useProposeTx(wallet);
  const apiDelete = useApiDeleteWallet();

  return useCallback(() => {
    assert(account);
    if (wallet.state === 'active') {
      propose(createRemoveGroupTx(account.contract, toWallet(wallet)));
    } else {
      return apiDelete(wallet);
    }
  }, [account, wallet, propose, apiDelete]);
};
