import { gql, useMutation } from '@apollo/client';
import {
  ApiTxsQuery,
  ApiTxsQueryVariables,
  RevokeApprovalMutation,
  RevokeApprovalMutationVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { hexlify } from 'ethers/lib/utils';
import { useCallback } from 'react';
import { useDevice } from '@features/device/useDevice';
import { toId } from 'lib';
import { API_GET_TXS_QUERY } from '~/queries/tx/useTxs.api';
import { Tx } from '~/queries/tx';
import produce from 'immer';
import assert from 'assert';
import { useSelectedWallet } from '~/components2/wallet/useSelectedWallet';

const MUTATION = gql`
  mutation RevokeApproval($account: Address!, $txHash: Bytes32!) {
    revokeApproval(account: $account, txHash: $txHash) {
      id
    }
  }
`;

export const useRevokeApproval = () => {
  const { accountAddr } = useSelectedWallet();
  const device = useDevice();

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
        variables: { account: accountAddr },
      };
      const data = cache.readQuery<ApiTxsQuery, ApiTxsQueryVariables>(
        queryOpts,
      ) ?? { txs: [] };

      cache.writeQuery<ApiTxsQuery, ApiTxsQueryVariables>({
        ...queryOpts,
        overwrite: true,
        data: produce(data, (data) => {
          const i = data.txs.findIndex((tx) => tx.id === revokedApproval.id);
          assert(i >= 0, 'Tx being revoked exists');

          // Revoke approval
          data.txs[i].approvals = data.txs[i].approvals?.filter(
            (a) => a.userId !== device.address,
          );

          // Revoke tx if it no longer has any approvals
          if (!data.txs[i].approvals?.length) data.txs.splice(i, 1);
        }),
      });
    },
  });

  const revoke = useCallback(
    (tx: Tx) =>
      mutation({
        variables: {
          account: accountAddr,
          txHash: hexlify(tx.hash),
        },
        optimisticResponse: {
          revokeApproval: {
            __typename: 'RevokeApprovalResp',
            id: toId(`${accountAddr}-${tx.hash}`),
          },
        },
      }),
    [mutation, accountAddr],
  );

  return revoke;
};
