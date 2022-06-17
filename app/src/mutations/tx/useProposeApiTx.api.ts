import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import {
  GetApiTxs,
  GetApiTxsVariables,
  ProposeTx,
  ProposeTxVariables,
  ProposeTx_proposeTx_ops,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { hexlify } from 'ethers/lib/utils';
import { hashTx, mapAsync, Op, signTx, toId } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { API_GET_TXS_QUERY, API_TX_FIELDS } from '~/queries/tx/useTxs';

const MUTATION = apiGql`
${API_TX_FIELDS}

mutation ProposeTx($safe: Address!, $ops: [OpInput!]!, $signature: Bytes!) {
  proposeTx(safe: $safe, ops: $ops, signature: $signature) {
    ...TxFields
  }
}
`;

export const useProposeApiTx = () => {
  const { safe } = useSafe();
  const wallet = useWallet();

  const [mutation] = useMutation<ProposeTx, ProposeTxVariables>(MUTATION, {
    client: useApiClient(),
  });

  const propose = useCallback(
    async (...ops: Op[]) => {
      const hash = await hashTx(safe.address, ...ops);
      const signature = await signTx(wallet, safe.address, ...ops);
      const createdAt = DateTime.now().toISO();

      return await mutation({
        variables: {
          safe: safe.address,
          ops: ops.map((op) => ({
            to: op.to,
            value: op.value.toString(),
            data: hexlify(op.data),
            nonce: op.nonce.toString(),
          })),
          signature,
        },
        update: (cache, { data: { proposeTx } }) => {
          const opts = {
            query: API_GET_TXS_QUERY,
            variables: { safe: safe.address },
          };
          const data = cache.readQuery<GetApiTxs, GetApiTxsVariables>(opts);

          cache.writeQuery<GetApiTxs, GetApiTxsVariables>({
            ...opts,
            data: { ...data, txs: [...data.txs, proposeTx] },
          });
        },
        optimisticResponse: {
          proposeTx: {
            __typename: 'Tx',
            id: toId(`${safe.address}-${hash}`),
            safeId: safe.address,
            hash,
            ops: await mapAsync(
              ops,
              async (op): Promise<ProposeTx_proposeTx_ops> => ({
                __typename: 'Op',
                hash: await hashTx(safe.address, op),
                to: op.to,
                value: op.value.toString(),
                data: hexlify(op.data),
                nonce: op.nonce.toString(),
              }),
            ),
            approvals: [
              {
                __typename: 'Approval',
                approverId: wallet.address,
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
