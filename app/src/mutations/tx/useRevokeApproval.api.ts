import { gql } from '@apollo/client';
import {
  TxQuery,
  TxQueryVariables,
  useRevokeApprovalMutation,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { hexlify } from 'ethers/lib/utils';
import { useCallback } from 'react';
import { useDevice } from '@features/device/useDevice';
import { Tx } from '~/queries/tx';
import produce from 'immer';
import { QueryOpts } from '@gql/update';
import { API_QUERY_TX } from '~/queries/tx/useTx.api';

gql`
  mutation RevokeApproval($account: Address!, $txHash: Bytes32!) {
    revokeApproval(account: $account, hash: $txHash) {
      id
    }
  }
`;

export const useRevokeApproval = () => {
  const device = useDevice();

  const [mutation] = useRevokeApprovalMutation({ client: useApiClient() });

  const revoke = useCallback(
    (tx: Tx) =>
      mutation({
        variables: {
          account: tx.account,
          txHash: hexlify(tx.hash),
        },
        optimisticResponse: {
          revokeApproval: {
            __typename: 'RevokeApprovalResp',
            id: tx.id,
          },
        },
        update: (cache, res) => {
          const revokedApproval = res?.data?.revokeApproval;
          if (!revokedApproval) return;

          // Tx; remove approval
          const opts: QueryOpts<TxQueryVariables> = {
            query: API_QUERY_TX,
            variables: { account: tx.account, hash: tx.hash },
          };

          const data = cache.readQuery<TxQuery>(opts);
          if (data?.tx) {
            cache.writeQuery<TxQuery>({
              ...opts,
              overwrite: true,
              data: produce(data, (data) => {
                if (!data?.tx?.approvals) return;

                if (data.tx.approvals.length > 1) {
                  // Revoke approval
                  data.tx.approvals = data.tx.approvals.filter(
                    (a) => a.userId !== device.address,
                  );
                } else {
                  // Revoke entire tx
                  data.tx = null;
                }
              }),
            });
          }
        },
      }),
    [device.address, mutation],
  );

  return revoke;
};
