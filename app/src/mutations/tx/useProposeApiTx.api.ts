import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import {
  GetApiTxs,
  GetApiTxsVariables,
  ProposeTx,
  ProposeTxVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { hexlify } from 'ethers/lib/utils';
import { createTx, hashTx, signTx, toId, TxDef } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { API_GET_TXS_QUERY, API_TX_FIELDS } from '~/queries/tx/useTxs';

const MUTATION = apiGql`
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

  const [mutation] = useMutation<ProposeTx, ProposeTxVariables>(MUTATION, {
    client: useApiClient(),
  });

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
