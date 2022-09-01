import { Address, createUpsertWalletTx } from 'lib';
import { useMemo, useState } from 'react';
import { useProposeTx } from '~/mutations/tx/propose/useProposeTx';
import { useAccount } from '~/queries/account/useAccount';
import { CombinedWallet, toSafeWallet } from '~/queries/wallets';
import { useApiUpsertWallet } from './useUpsertWallet.api';

type Upsert = ((cur: CombinedWallet) => Promise<void>) | undefined;

export const useUpsertWallet = (accountAddr: Address): [Upsert, boolean] => {
  const account = useAccount(accountAddr)?.account;
  const [propose] = useProposeTx();
  const apiUpsert = useApiUpsertWallet();

  const [upserting, setUpserting] = useState(false);

  const upsert = useMemo(
    () =>
      account?.contract &&
      (async (wallet: CombinedWallet) => {
        setUpserting(true);

        await propose(
          wallet,
          createUpsertWalletTx(account.contract, toSafeWallet(wallet)),
          (tx) => {
            apiUpsert(wallet, tx.hash);
          },
        );

        setUpserting(false);
      }),
    [account?.contract, apiUpsert, propose],
  );

  return [upsert, upserting];
};
