import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import { ProposeTx, ProposeTxVariables } from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { ethers } from 'ethers';
import { Op, signTx } from 'lib';
import { useCallback } from 'react';
import { API_TX_FIELDS } from '~/queries/tx/useTxs';

const MUTATION = apiGql`
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

  const [mutation] = useMutation<ProposeTx, ProposeTxVariables>(MUTATION, {
    client: useApiClient(),
  });

  const propose = useCallback(
    async (...ops: Op[]) => {
      const options: MutationFunctionOptions<ProposeTx, ProposeTxVariables> = {
        variables: {
          safe: safe.address,
          ops: ops.map((op) => ({
            to: op.to,
            value: op.value.toString(),
            data: ethers.utils.hexlify(op.data),
            nonce: op.nonce.toString(),
          })),
          signature: await signTx(wallet, safe.address, ...ops),
        },
      };

      console.log('Proposing', { ops });
      console.log(JSON.stringify(options, null, 2));

      const r = await mutation(options);

      console.log('Proposal response', r);

      return r;
    },
    [mutation, wallet, safe.address],
  );

  return propose;
};
