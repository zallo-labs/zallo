import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { Propose, ProposeVariables } from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { BytesLike, ethers } from 'ethers';
import { Op } from 'lib';
import { useCallback } from 'react';

const MUTATION = apiGql`
mutation Propose($safe: Address!, $ops: [OpInput!]!, $signature: Bytes!) {
  proposeTx(safe: $safe, ops: $ops, signature: $signature) {
    ...TxFields
  }
}
`;

export const useProposeTx = () => {
  const { safe } = useSafe();

  const [mutation] = useMutation<Propose, ProposeVariables>(MUTATION, {
    client: useApiClient(),
  });

  const propose = useCallback(
    (ops: Op[], signature: BytesLike) =>
      mutation({
        variables: {
          safe: safe.address,
          ops: ops.map((op) => ({
            to: op.to,
            value: op.value.toString(),
            data: ethers.utils.hexlify(op.data),
            nonce: op.nonce.toString(),
          })),
          signature: ethers.utils.hexlify(signature),
        },
      }),
    [mutation, safe.address],
  );

  return propose;
};
