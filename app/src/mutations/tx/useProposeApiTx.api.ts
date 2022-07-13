import { gql, useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import {
  ApiTxsQuery,
  ApiTxsQueryVariables,
  ProposeTxMutation,
  ProposeTxMutationVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { hexlify } from 'ethers/lib/utils';
import { createTx, hashTx, signTx, toId, TxDef } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { API_GET_TXS_QUERY, API_TX_FIELDS } from '~/queries/tx/useTxs.api';

const MUTATION = gql`
  ${API_TX_FIELDS}

  mutation ProposeTx($safe: Address!, $tx: TxInput!, $signature: Bytes!) {
    proposeTx(safe: $safe, tx: $tx, signature: $signature) {
      ...TxFields
    }
  }
`;

export const useProposeApiTx = () => {
  const { safe } = useSafe();
  const wallet = useWallet();

  const [mutation] = useMutation<ProposeTxMutation, ProposeTxMutationVariables>(
    MUTATION,
    { client: useApiClient() },
  );

  const propose = useCallback(
    async (txDef: TxDef) => {
      const txReq = createTx(txDef);
      const hash = await hashTx(safe.address, txReq);
      const signature = await signTx(wallet, safe.address, txReq);
      const createdAt = DateTime.now().toISO();

      return await mutation({
        variables: {
          safe: safe.address,
          tx: {
            to: txReq.to,
            value: txReq.value.toString(),
            data: hexlify(txReq.data),
            salt: hexlify(txReq.salt),
          },
          signature,
        },
        update: (cache, res) => {
          const proposedTx = res?.data?.proposeTx;
          if (!proposedTx) return;

          const opts = {
            query: API_GET_TXS_QUERY,
            variables: { safe: safe.address },
          };
          const data = cache.readQuery<ApiTxsQuery, ApiTxsQueryVariables>(
            opts,
          ) ?? {
            txs: [],
          };

          cache.writeQuery<ApiTxsQuery, ApiTxsQueryVariables>({
            ...opts,
            data: { ...data, txs: [...data.txs, proposedTx] },
          });
        },
        optimisticResponse: {
          proposeTx: {
            __typename: 'Tx',
            id: toId(`${safe.address}-${hash}`),
            safeId: safe.address,
            hash,
            to: txReq.to,
            value: txReq.value.toString(),
            data: hexlify(txReq.data),
            salt: hexlify(txReq.salt),
            approvals: [
              {
                __typename: 'Approval',
                userId: wallet.address,
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
    [mutation, wallet, safe.address],
  );

  return propose;
};
