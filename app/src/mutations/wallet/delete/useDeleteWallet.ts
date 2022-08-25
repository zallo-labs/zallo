import assert from 'assert';
import { createRemoveGroupTx } from 'lib';
import { useCallback, useState } from 'react';
import { useProposeTx } from '~/mutations/tx/propose/useProposeTx';
import { useAccount } from '~/queries/account/useAccount';
import { CombinedWallet, toSafeWallet } from '~/queries/wallets';
import { useApiDeleteWallet } from './useDeleteWallet.api';

type Delete = () => void;

export const useDeleteWallet = (wallet: CombinedWallet): [Delete, boolean] => {
  const account = useAccount(wallet.accountAddr).account;
  const [propose] = useProposeTx(wallet);
  const apiDelete = useApiDeleteWallet();

  const [deleting, setDeleting] = useState(false);

  const del = useCallback(async () => {
    assert(account);
    setDeleting(true);

    if (wallet.state.status === 'active') {
      await propose(
        createRemoveGroupTx(account.contract, toSafeWallet(wallet)),
      );
    } else {
      await apiDelete(wallet);
    }

    setDeleting(false);
  }, [account, wallet, propose, apiDelete]);

  return [del, deleting];
};
