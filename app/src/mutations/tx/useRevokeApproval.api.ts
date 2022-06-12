import {
  ApolloCache,
  DataProxy,
  UpdateQueryOptions,
  useMutation,
} from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import {
  GetApiTxs,
  GetApiTxsVariables,
  GetApiTxs_txs,
  RevokeApproval,
  RevokeApprovalVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { API_GET_TXS_QUERY, Tx } from '~/queries/tx/useTxs';
import { hexlify } from 'ethers/lib/utils';
import { useCallback } from 'react';
import { useWallet } from '@features/wallet/useWallet';
import { isPresent, toId } from 'lib';

const MUTATION = apiGql`
mutation RevokeApproval($safe: Address!, $txHash: Bytes32!) {
  revokeApproval(safe: $safe, txHash: $txHash) {
    id
  }
}
`;

interface ReplaceQueryOptions<Data, Variables>
  extends DataProxy.Query<Variables, Data> {
  cache: ApolloCache<unknown>;
  replacer: (data: Data) => Data;
  overwrite?: boolean;
}

const replaceQuery = <Data, Variables>({
  cache,
  replacer,
  overwrite,
  ...queryOpts
}: ReplaceQueryOptions<Data, Variables>) => {
  const data = cache.readQuery<Data, Variables>(queryOpts);

  cache.writeQuery({
    ...queryOpts,
    overwrite,
    data: replacer(data),
  });
};

export const useRevokeApproval = () => {
  const { safe } = useSafe();
  const wallet = useWallet();

  const [mutation] = useMutation<RevokeApproval, RevokeApprovalVariables>(
    MUTATION,
    {
      client: useApiClient(),
      update: (cache, { data: { revokeApproval } }) => {
        const queryOpts = {
          query: API_GET_TXS_QUERY,
          variables: { safe: safe.address },
        };
        const data = cache.readQuery<GetApiTxs, GetApiTxsVariables>(queryOpts);

        let newTxs = [...data.txs];
        const i = newTxs.findIndex((tx) => tx.id === revokeApproval.id);
        if (i >= 0) {
          const tx = newTxs[i];
          const approvals = tx.approvals.filter(
            (a) => a.approverId !== wallet.address,
          );

          if (approvals.length) {
            newTxs[i] = { ...tx, approvals };
          } else {
            newTxs = newTxs.splice(i, 1);
          }
        }

        cache.writeQuery<GetApiTxs, GetApiTxsVariables>({
          ...queryOpts,
          overwrite: true,
          data: { txs: newTxs },
        });

        // cache.writeQuery<GetApiTxs, GetApiTxsVariables>({
        //   ...queryOpts,
        //   data: {
        //     txs: data.txs
        //       .map((tx): GetApiTxs_txs | undefined => {
        //         if (tx.id !== revokeApproval.id) return { ...tx };

        //         const approvals = tx.approvals.filter(
        //           (a) => a.approverId !== wallet.address,
        //         );

        //         // Remove the tx entirely if there are no approvals post revokation
        //         return !approvals.length
        //           ? {
        //               ...tx,
        //               approvals,
        //             }
        //           : undefined;
        //       })
        //       .filter((t) => t !== undefined),
        //   },
        //   overwrite: true,
        // });
      },
    },
  );

  const revoke = useCallback(
    (tx: Tx) =>
      mutation({
        variables: {
          safe: safe.address,
          txHash: hexlify(tx.hash),
        },
        optimisticResponse: {
          revokeApproval: {
            __typename: 'RevokeApprovalResp',
            id: toId(`${safe.address}-${tx.hash}`),
          },
        },
      }),
    [mutation, safe.address],
  );

  return revoke;
};
