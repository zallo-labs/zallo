import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import { ProposeTx, ProposeTxVariables } from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { Op, signTx } from 'lib';
import { useCallback } from 'react';
import { API_TX_FIELDS } from './useTxs';

const API_MUTATION = apiGql`
${API_TX_FIELDS}

mutation ProposeTx($safe: Address!, $ops: [OpInput!]!, $signature: Bytes!) {
  proposeTx(safe: $safe, ops: $ops, signature: $signature) {
    ...TxFields
  }
}
`;

export const useProposeTx = () => {
  const { safe } = useSafe();
  const wallet = useWallet();

  const [mutate] = useMutation<ProposeTx, ProposeTxVariables>(API_MUTATION, {
    client: useApiClient(),
  });

  const propose = useCallback(
    async (...ops: Op[]) => {
      const r = await mutate({
        variables: {
          safe: safe.address,
          ops: ops.map((op) => ({
            ...op,
            value: op.value.toString(),
            nonce: op.nonce.toString(),
          })),
          signature: await signTx(wallet, safe.address, ...ops),
        },
      });

      console.log('Proposed', ops);

      return r;
    },
    [mutate, safe, wallet],
  );

  return propose;
};
