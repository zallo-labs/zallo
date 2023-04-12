import { gql } from '@apollo/client';
import {
  AccountFieldsFragmentDoc,
  AccountIdsDocument,
  AccountIdsQuery,
  AccountIdsQueryVariables,
  useCreateAccountMutation,
} from '@api/generated';
import { useUser } from '@api/user';
import { updateQuery } from '~/gql/util';
import { AccountId, asAccountId } from './types';

gql`
  ${AccountFieldsFragmentDoc}

  mutation CreateAccount($args: CreateAccountInput!) {
    createAccount(args: $args) {
      ...AccountFields
    }
  }
`;

export interface CreateAccountResult {
  id: AccountId;
}

export const useCreateAccount = () => {
  const user = useUser();
  const [mutation] = useCreateAccountMutation();

  return async (name: string): Promise<CreateAccountResult> => {
    const r = await mutation({
      variables: {
        args: {
          name,
          policies: {
            approvers: [user.id],
            permissions: {},
          },
        },
      },
      update: (cache, res) => {
        const account = res.data?.createAccount;
        if (!account) return;

        // Insert id
        updateQuery<AccountIdsQuery, AccountIdsQueryVariables>({
          query: AccountIdsDocument,
          cache,
          variables: {},
          defaultData: { accounts: [] },
          updater: (data) => {
            if (!data.accounts.find((a) => a.id === account.id))
              data.accounts.push({
                __typename: 'Account',
                id: account.id,
              });
          },
        });
      },
    });

    const a = r.data?.createAccount;
    if (!a) throw new Error('Failed to create account');

    return { id: asAccountId(a.id) };
  };
};
