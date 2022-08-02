import { gql, useMutation } from '@apollo/client';
import { useWallet } from '@features/wallet/useWallet';
import {
  ApproveTxMutation,
  ApproveTxMutationVariables,
  ApiTxsQuery,
  ApiTxsQueryVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import assert from 'assert';
import produce from 'immer';
import { signTx, toId } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { useSelectedAccount } from '~/components2/account/useSelectedAccount';
import { Tx } from '~/queries/tx';
import { API_TX_FIELDS, API_GET_TXS_QUERY } from '~/queries/tx/useTxs.api';

const MUTATION = gql`
  ${API_TX_FIELDS}

  mutation ApproveTx($safe: Address!, $txHash: Bytes32!, $signature: Bytes!) {
    approve(safe: $safe, txHash: $txHash, signature: $signature) {
      id
    }
  }
`;

export const useApproveTx = () => {
  const { safeAddr } = useSelectedAccount();
  const wallet = useWallet();

  const [mutate] = useMutation<ApproveTxMutation, ApproveTxMutationVariables>(
    MUTATION,
    { client: useApiClient() },
  );

  const approve = useCallback(
    async (tx: Tx) => {
      const signature = await signTx(wallet, safeAddr, tx);

      return await mutate({
        variables: {
          safe: safeAddr,
          txHash: tx.hash,
          signature,
        },
        update: (cache, res) => {
          const approvedTxId = res?.data?.approve?.id;
          if (!approvedTxId) return;

          const opts = {
            query: API_GET_TXS_QUERY,
            variables: { safe: safeAddr },
          };
          const data = cache.readQuery<ApiTxsQuery, ApiTxsQueryVariables>(
            opts,
          ) ?? {
            txs: [],
          };

          cache.writeQuery<ApiTxsQuery, ApiTxsQueryVariables>({
            ...opts,
            data: produce(data, (data) => {
              const i = data.txs.findIndex((t) => t.id === tx.id);
              assert(i >= 0, 'Tx being approved exists');

              data.txs[i].approvals = [
                ...(data.txs[i].approvals ?? []),
                {
                  __typename: 'Approval',
                  userId: wallet.address,
                  createdAt: DateTime.now().toISO(),
                  signature,
                },
              ];
            }),
          });
        },
        optimisticResponse: {
          approve: {
            __typename: 'Tx',
            id: toId(`${safeAddr}-${tx.hash}`),
          },
        },
      });
    },
    [mutate, safeAddr, wallet],
  );

  return approve;
};
