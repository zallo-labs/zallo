import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { RevokeApproval, RevokeApprovalVariables } from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { Tx } from '@gql/queries/useTxs';
import { hexlify } from 'ethers/lib/utils';
import { useCallback } from 'react';

const MUTATION = apiGql`
mutation RevokeApproval($safe: Address!, $txHash: Bytes32!) {
  revokeApproval(safe: $safe, txHash: $txHash) {
    id
  }
}
`;

export const useRevokeApproval = () => {
  const { safe } = useSafe();

  const [mutation] = useMutation<RevokeApproval, RevokeApprovalVariables>(
    MUTATION,
    { client: useApiClient() },
  );

  const revoke = useCallback(
    () => (tx: Tx) =>
      mutation({
        variables: {
          safe: safe.address,
          txHash: hexlify(tx.hash),
        },
      }),
    [mutation, safe.address],
  );

  return revoke;
};
