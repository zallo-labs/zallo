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

  mutation CreateAccount($name: String!, $policies: [PolicyInput!]!) {
    createAccount(name: $name, policies: $policies) {
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
        name,
        policies: {
          rules: {
            approvers: [user.id],
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
            const i = data.accounts.findIndex((a) => a.id === account.id);
            data.accounts[i >= 0 ? i : data.accounts.length] = account;
          },
        });
      },
    });

    const a = r.data?.createAccount;
    if (!a) throw new Error('Failed to create account');

    return { id: asAccountId(a.id) };
  };
};
