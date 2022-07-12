import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import {
  ApproveTx,
  ApproveTxVariables,
  GetApiTxs,
  GetApiTxsVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { signTx, toId } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { API_GET_TXS_QUERY, API_TX_FIELDS, Tx } from '~/queries/tx/useTxs';

const MUTATION = apiGql`
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

  const [mutate] = useMutation<ApproveTx, ApproveTxVariables>(MUTATION, {
    client: useApiClient(),
  });

  const approve = useCallback(
    async (tx: Tx) => {
      const signature = await signTx(wallet, safe.address, tx);

      return await mutate({
        variables: {
          safe: safe.address,
          txHash: tx.hash,
          signature,
        },
        update: (cache, { data: { approve } }) => {
          const opts = {
            query: API_GET_TXS_QUERY,
            variables: { safe: safe.address },
          };
          const data = cache.readQuery<GetApiTxs, GetApiTxsVariables>(opts);

          cache.writeQuery<GetApiTxs, GetApiTxsVariables>({
            ...opts,
            data: {
              txs: data.txs.map((tx) => {
                if (tx.id !== approve.id) return tx;

                return {
                  ...tx,
                  approvals: [
                    ...tx.approvals,
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
