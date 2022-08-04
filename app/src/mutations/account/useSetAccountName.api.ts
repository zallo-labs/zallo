import { gql } from '@apollo/client';
import { useSetAccountNameMutation } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { useCallback } from 'react';
import { CombinedAccount } from '~/queries/accounts';
import { API_ACCOUNT_FIELDS } from '~/queries/accounts/useAccounts.api';
import { updateApiUserAccountsCache } from './useSetAccountQuorums.api';

const QUERY = gql`
  ${API_ACCOUNT_FIELDS}

  mutation SetAccountName($id: AccountId!, $name: String!) {
    setAccountName(id: $id, name: $name) {
      ...AccountFields
    }
  }
`;

export const useSetAccountName = () => {
  const [mutate] = useSetAccountNameMutation({ client: useApiClient() });

  return useCallback(
    ({ id, safeAddr, ref, name, quorums }: CombinedAccount) => {
      return mutate({
        variables: {
          id: { safeId: safeAddr, ref },
          name,
        },
        optimisticResponse: {
          setAccountName: {
            __typename: 'Account',
            id,
            safeId: safeAddr,
            ref,
            name,
            quorums: quorums.map((quorum) => ({
              __typename: 'Quorum',
              approvers: quorum.approvers.map((approver) => ({
                __typename: 'Approver',
                userId: approver,
              })),
            })),
          },
        },
        update: (cache, result) => {
          const acc = result.data?.setAccountName;
          if (acc) updateApiUserAccountsCache(cache, [acc]);
        },
      });
    },
    [mutate],
  );
};
