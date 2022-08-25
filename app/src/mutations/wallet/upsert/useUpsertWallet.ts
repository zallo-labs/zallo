import { createUpsertWalletTx } from 'lib';
import { useMemo, useState } from 'react';
import { useProposeTx } from '~/mutations/tx/propose/useProposeTx';
import { useAccount } from '~/queries/account/useAccount';
import { CombinedWallet, toSafeWallet } from '~/queries/wallets';
import { useApiUpsertWallet } from './useUpsertWallet.api';

type Upsert = ((cur: CombinedWallet) => Promise<void>) | undefined;

export const useUpsertWallet = (wallet: CombinedWallet): [Upsert, boolean] => {
  const account = useAccount(wallet.accountAddr)?.account;
  const [propose] = useProposeTx(wallet);
  const apiUpsert = useApiUpsertWallet();

  const [upserting, setUpserting] = useState(false);

  const upsert = useMemo(
    () =>
      account?.contract &&
      (async (cur: CombinedWallet) => {
        setUpserting(true);

        await propose(
          createUpsertWalletTx(account.contract, toSafeWallet(cur)),
          (tx) => {
            apiUpsert(cur, tx.hash);
          },
        );

        setUpserting(false);
      }),
    [account?.contract, apiUpsert, propose],
  );

  return [upsert, upserting];
};
