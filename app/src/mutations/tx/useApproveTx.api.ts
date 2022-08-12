import { gql } from '@apollo/client';
import { useDevice } from '@features/device/useDevice';
import {
  TxQuery,
  TxQueryVariables,
  useApproveTxMutation,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import assert from 'assert';
import produce from 'immer';
import { getTxId, signTx, toId } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { Tx } from '~/queries/tx';
import { API_QUERY_TX } from '~/queries/tx/useTx.api';

gql`
  mutation ApproveTx(
    $account: Address!
    $txHash: Bytes32!
    $signature: Bytes!
  ) {
    approve(account: $account, hash: $txHash, signature: $signature) {
      id
    }
  }
`;

export const useApproveTx = () => {
  const device = useDevice();

  const [mutate] = useApproveTxMutation({ client: useApiClient() });

  const approve = useCallback(
    async (tx: Tx) => {
      const signature = await signTx(device, tx.account, tx);

      return await mutate({
        variables: {
          account: tx.account,
          txHash: tx.hash,
          signature,
        },
        update: (cache, res) => {
          if (!res?.data?.approve) return;

          // Tx; update approvals
          const opts: QueryOpts<TxQueryVariables> = {
            query: API_QUERY_TX,
            variables: { account: tx.account, hash: tx.hash },
          };
          const data = cache.readQuery<TxQuery, TxQueryVariables>(opts);
          assert(data);

          cache.writeQuery<TxQuery>({
            ...opts,
            data: produce(data, (data) => {
              data.tx?.approvals?.push({
                __typename: 'Approval',
                userId: device.address,
                createdAt: DateTime.now().toISO(),
                signature,
              });
            }),
          });
        },
        optimisticResponse: {
          approve: {
            __typename: 'Tx',
            id: getTxId(tx.account, tx.hash),
          },
        },
      });
    },
    [mutate, device],
  );

  return approve;
};
