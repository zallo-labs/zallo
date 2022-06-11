import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import { ApproveTx, ApproveTxVariables } from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { signTx } from 'lib';
import { useCallback } from 'react';
import { API_TX_FIELDS, Tx } from '~/queries/tx/useTxs';

const MUTATION = apiGql`
${API_TX_FIELDS}

mutation ApproveTx($safe: Address!, $txHash: Bytes32!, $signature: Bytes!) {
    approve(safe: $safe, txHash: $txHash, signature: $signature) {
      ...TxFields
    }
  }
`;

export const useApproveTx = () => {
  const { safe } = useSafe();
  const wallet = useWallet();

  const [mutate] = useMutation<ApproveTx, ApproveTxVariables>(MUTATION, {
    client: useApiClient(),
  });

  const approve = useCallback(
    async (tx: Tx) =>
      await mutate({
        variables: {
          safe: safe.address,
          txHash: tx.hash,
          signature: await signTx(wallet, safe.address, ...tx.ops),
        },
      }),
    [mutate, safe.address, wallet],
  );

  return approve;
};
