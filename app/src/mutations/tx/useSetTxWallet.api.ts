import { gql } from '@apollo/client';
import {
  TxQuery,
  TxQueryVariables,
  useSetTxWallelMutation,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { QueryOpts } from '~/gql/update';
import produce from 'immer';
import { useCallback } from 'react';
import { ProposedTx } from '~/queries/tx';
import { API_QUERY_TX } from '~/queries/tx/tx/useTx.api';
import { WalletId } from '~/queries/wallets';

gql`
  mutation SetTxWallel(
    $account: Address!
    $hash: Bytes32!
    $walletRef: Bytes4!
  ) {
    setTxWallet(account: $account, hash: $hash, walletRef: $walletRef) {
      id
    }
  }
`;

export const useApiSetTxWallet = (tx: ProposedTx) => {
  const [mutate] = useSetTxWallelMutation({ client: useApiClient() });

  return useCallback(
    (newWallet: WalletId) =>
      mutate({
        variables: {
          account: tx.account,
          hash: tx.hash,
          walletRef: newWallet.ref,
        },
        optimisticResponse: {
          setTxWallet: {
            __typename: 'Tx',
            id: tx.hash,
          },
        },
        update: (cache, res) => {
          if (!res.data?.setTxWallet?.id) return;

          // Tx; update wallet ref
          const opts: QueryOpts<TxQueryVariables> = {
            query: API_QUERY_TX,
            variables: {
              account: tx.account,
              hash: tx.hash,
            },
          };

          const data = cache.readQuery<TxQuery>(opts);
          if (data) {
            cache.writeQuery<TxQuery>({
              ...opts,
              data: produce(data, (data) => {
                if (data.tx) data.tx.walletRef = newWallet.ref;
              }),
            });
          }
        },
      }),
    [mutate, tx.account, tx.hash],
  );
};
