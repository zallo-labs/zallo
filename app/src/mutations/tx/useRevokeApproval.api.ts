import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import {
  GetApiTxs,
  GetApiTxsVariables,
  RevokeApproval,
  RevokeApprovalVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { API_GET_TXS_QUERY, Tx } from '~/queries/tx/useTxs';
import { hexlify } from 'ethers/lib/utils';
import { useCallback } from 'react';
import { useWallet } from '@features/wallet/useWallet';
import { toId } from 'lib';

const MUTATION = apiGql`
mutation RevokeApproval($safe: Address!, $txHash: Bytes32!) {
  revokeApproval(safe: $safe, txHash: $txHash) {
    id
  }
}
`;

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

        const newTxs = [...data.txs];
        const i = newTxs.findIndex((tx) => tx.id === revokeApproval.id);
        if (i >= 0) {
          const tx = newTxs[i];
          const approvals = tx.approvals.filter(
            (a) => a.userId !== wallet.address,
          );

          if (approvals.length) {
            newTxs[i] = { ...tx, approvals };
          } else {
            newTxs.splice(i, 1);
          }
        }

        cache.writeQuery<GetApiTxs, GetApiTxsVariables>({
          ...queryOpts,
          overwrite: true,
          data: { txs: newTxs },
        });
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
