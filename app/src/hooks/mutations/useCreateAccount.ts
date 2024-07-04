import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { useCreateAccountMutation } from '~/api/__generated__/useCreateAccountMutation.graphql';
import { useCreateAccountUpdaterQuery } from '~/api/__generated__/useCreateAccountUpdaterQuery.graphql';
import { useCreateAccount_query$key } from '~/api/__generated__/useCreateAccount_query.graphql';

graphql`
  fragment useCreateAccount_assignable_account on Account @assignable {
    __typename
  }
`;

const Query = graphql`
  fragment useCreateAccount_query on Query {
    accounts {
      ...useCreateAccount_assignable_account
    }
  }
`;

const Create = graphql`
  mutation useCreateAccountMutation($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
      address
      ...useCreateAccount_assignable_account
    }
  }
`;

export interface UseCreateAccountMutationParams {
  query: useCreateAccount_query$key;
}

export function useCreateAccount(params: UseCreateAccountMutationParams) {
  const { accounts } = useFragment(Query, params.query);

  return useMutation<useCreateAccountMutation>(Create, {
    updater: (store, data) => {
      const account = data?.createAccount;
      if (!account) return;
      const { updatableData } = store.readUpdatableQuery<useCreateAccountUpdaterQuery>(
        graphql`
          query useCreateAccountUpdaterQuery @updatable {
            accounts {
              ...useCreateAccount_assignable_account
            }
          }
        `,
        {},
      );

      updatableData.accounts = [...accounts, account];
    },
  });
}
