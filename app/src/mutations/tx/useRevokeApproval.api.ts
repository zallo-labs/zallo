import { gql } from '@apollo/client';
import {
  TxQuery,
  TxQueryVariables,
  TxsMetadataDocument,
  TxsMetadataQuery,
  TxsMetadataQueryVariables,
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
import { useAccountIds } from '~/queries/account/useAccountIds';

gql`
  mutation RevokeApproval($account: Address!, $txHash: Bytes32!) {
    revokeApproval(account: $account, hash: $txHash) {
      id
    }
  }
`;

export const useRevokeApproval = () => {
  const device = useDevice();
  const accounts = useAccountIds();

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
          const txOpts: QueryOpts<TxQueryVariables> = {
            query: API_QUERY_TX,
            variables: { account: tx.account, hash: tx.hash },
          };

          const txData = cache.readQuery<TxQuery>(txOpts);
          const shouldDelete = txData?.tx?.approvals?.length === 1;

          if (txData?.tx) {
            cache.writeQuery<TxQuery>({
              ...txOpts,
              overwrite: true,
              data: produce(txData, (data) => {
                if (!data?.tx?.approvals) return;

                if (shouldDelete) {
                  data.tx = null;
                } else {
                  data.tx.approvals = data.tx.approvals.filter(
                    (a) => a.userId !== device.address,
                  );
                }
              }),
            });
          }

          if (shouldDelete) {
            // TxsMetadata
            const opts: QueryOpts<TxsMetadataQueryVariables> = {
              query: TxsMetadataDocument,
              variables: { accounts },
            };

            const data = cache.readQuery<TxsMetadataQuery>(opts);
            if (data) {
              cache.writeQuery<TxsMetadataQuery>({
                ...opts,
                overwrite: true,
                data: produce(data, (data) => {
                  if (!data?.txs) return;

                  data.txs = data.txs.filter(
                    (tx) => tx.id !== revokedApproval.id,
                  );
                }),
              });
            }
          }
        },
      }),
    [accounts, device.address, mutation],
  );

  return revoke;
};
