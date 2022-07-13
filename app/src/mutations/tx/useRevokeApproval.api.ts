import { gql, useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import {
  ApiTxsQuery,
  ApiTxsQueryVariables,
  RevokeApprovalMutation,
  RevokeApprovalMutationVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { hexlify } from 'ethers/lib/utils';
import { useCallback } from 'react';
import { useWallet } from '@features/wallet/useWallet';
import { toId } from 'lib';
import { API_GET_TXS_QUERY } from '~/queries/tx/useTxs.api';
import { Tx } from '~/queries/tx';

const MUTATION = gql`
  mutation RevokeApproval($safe: Address!, $txHash: Bytes32!) {
    revokeApproval(safe: $safe, txHash: $txHash) {
      id
    }
  }
`;

export const useRevokeApproval = () => {
  const { safe } = useSafe();
  const wallet = useWallet();

  const [mutation] = useMutation<
    RevokeApprovalMutation,
    RevokeApprovalMutationVariables
  >(MUTATION, {
    client: useApiClient(),
    update: (cache, res) => {
      const revokedApproval = res?.data?.revokeApproval;
      if (!revokedApproval) return;

      const queryOpts = {
        query: API_GET_TXS_QUERY,
        variables: { safe: safe.address },
      };
      const data = cache.readQuery<ApiTxsQuery, ApiTxsQueryVariables>(
        queryOpts,
      ) ?? { txs: [] };

      const newTxs = [...data.txs];
      const i = newTxs.findIndex((tx) => tx.id === revokedApproval.id);
      if (i >= 0) {
        const tx = newTxs[i];
        const approvals = (tx.approvals ?? []).filter(
          (a) => a.userId !== wallet.address,
        );

        if (approvals.length) {
          newTxs[i] = { ...tx, approvals };
        } else {
          newTxs.splice(i, 1);
        }
      }

      cache.writeQuery<ApiTxsQuery, ApiTxsQueryVariables>({
        ...queryOpts,
        overwrite: true,
        data: { txs: newTxs },
      });
    },
  });

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
