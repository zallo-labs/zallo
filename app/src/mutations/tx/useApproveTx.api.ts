import { gql, useMutation } from '@apollo/client';
import { useDevice } from '@features/device/useDevice';
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
import { useSelectedWallet } from '~/components2/wallet/useSelectedWallet';
import { Tx } from '~/queries/tx';
import { API_TX_FIELDS, API_GET_TXS_QUERY } from '~/queries/tx/useTxs.api';

const MUTATION = gql`
  ${API_TX_FIELDS}

  mutation ApproveTx(
    $account: Address!
    $txHash: Bytes32!
    $signature: Bytes!
  ) {
    approve(account: $account, txHash: $txHash, signature: $signature) {
      id
    }
  }
`;

export const useApproveTx = () => {
  const { accountAddr } = useSelectedWallet();
  const device = useDevice();

  const [mutate] = useMutation<ApproveTxMutation, ApproveTxMutationVariables>(
    MUTATION,
    { client: useApiClient() },
  );

  const approve = useCallback(
    async (tx: Tx) => {
      const signature = await signTx(device, accountAddr, tx);

      return await mutate({
        variables: {
          account: accountAddr,
          txHash: tx.hash,
          signature,
        },
        update: (cache, res) => {
          const approvedTxId = res?.data?.approve?.id;
          if (!approvedTxId) return;

          const opts = {
            query: API_GET_TXS_QUERY,
            variables: { account: accountAddr },
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
                  userId: device.address,
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
            id: toId(`${accountAddr}-${tx.hash}`),
          },
        },
      });
    },
    [mutate, accountAddr, device],
  );

  return approve;
};
