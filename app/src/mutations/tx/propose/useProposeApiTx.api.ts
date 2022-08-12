import { gql } from '@apollo/client';
import { useDevice } from '@features/device/useDevice';
import {
  TxQuery,
  TxQueryVariables,
  useProposeTxMutation,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { hexlify } from 'ethers/lib/utils';
import { Address, createTx, getTxId, hashTx, signTx, TxDef } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { API_QUERY_TX, API_TX_FIELDS } from '~/queries/tx/useTx.api';

gql`
  ${API_TX_FIELDS}

  mutation ProposeTx($account: Address!, $tx: TxInput!, $signature: Bytes!) {
    proposeTx(account: $account, tx: $tx, signature: $signature) {
      ...TxFields
    }
  }
`;

export const useProposeApiTx = (accountAddr: Address) => {
  const device = useDevice();

  const [mutation] = useProposeTxMutation({ client: useApiClient() });

  const propose = useCallback(
    async (txDef: TxDef) => {
      const tx = createTx(txDef);
      const hash = await hashTx(accountAddr, tx);
      const signature = await signTx(device, accountAddr, tx);
      const createdAt = DateTime.now().toISO();

      return await mutation({
        variables: {
          account: accountAddr,
          tx: {
            to: tx.to,
            value: tx.value.toString(),
            data: hexlify(tx.data),
            salt: hexlify(tx.salt),
          },
          signature,
        },
        update: (cache, res) => {
          const proposedTx = res?.data?.proposeTx;
          if (!proposedTx) return;

          // Tx; create
          cache.writeQuery<TxQuery, TxQueryVariables>({
            query: API_QUERY_TX,
            variables: { account: proposedTx.accountId, hash: proposedTx.hash },
            data: {
              tx: proposedTx,
            },
          });
        },
        optimisticResponse: {
          proposeTx: {
            __typename: 'Tx',
            id: getTxId(accountAddr, hash),
            accountId: accountAddr,
            hash,
            to: tx.to,
            value: tx.value.toString(),
            data: hexlify(tx.data),
            salt: hexlify(tx.salt),
            approvals: [
              {
                __typename: 'Approval',
                userId: device.address,
                signature,
                createdAt,
              },
            ],
            createdAt,
            submissions: [],
          },
        },
      });
    },
    [accountAddr, device, mutation],
  );

  return propose;
};
