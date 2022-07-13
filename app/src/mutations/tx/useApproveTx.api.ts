import { gql, useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import {
  ApproveTxMutation,
  ApproveTxMutationVariables,
  ApiTxsQuery,
  ApiTxsQueryVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { signTx, toId } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
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
  const { safe } = useSafe();
  const wallet = useWallet();

  const [mutate] = useMutation<ApproveTxMutation, ApproveTxMutationVariables>(
    MUTATION,
    { client: useApiClient() },
  );

  const approve = useCallback(
    async (tx: Tx) => {
      const signature = await signTx(wallet, safe.address, tx);

      return await mutate({
        variables: {
          safe: safe.address,
          txHash: tx.hash,
          signature,
        },
        update: (cache, res) => {
          const approvedTxId = res?.data?.approve?.id;
          if (!approvedTxId) return;

          const opts = {
            query: API_GET_TXS_QUERY,
            variables: { safe: safe.address },
          };
          const data = cache.readQuery<ApiTxsQuery, ApiTxsQueryVariables>(
            opts,
          ) ?? {
            txs: [],
          };

          cache.writeQuery<ApiTxsQuery, ApiTxsQueryVariables>({
            ...opts,
            data: {
              txs: data.txs.map((tx) => {
                if (tx.id !== approvedTxId) return tx;

                return {
                  ...tx,
                  approvals: [
                    ...(tx.approvals ?? []),
                    {
                      __typename: 'Approval',
                      userId: wallet.address,
                      createdAt: DateTime.now().toISO(),
                      signature,
                    },
                  ],
                };
              }),
            },
          });
        },
        optimisticResponse: {
          approve: {
            __typename: 'Tx',
            id: toId(`${safe.address}-${tx.hash}`),
          },
        },
      });
    },
    [mutate, safe.address, wallet],
  );

  return approve;
};
