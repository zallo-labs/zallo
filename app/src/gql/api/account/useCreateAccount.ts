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
import { Address } from 'lib';

gql`
  ${AccountFieldsFragmentDoc}

  mutation CreateAccount($input: CreateAccountInput!) {
    createAccount(input: $input) {
      ...AccountFields
    }
  }
`;

export interface CreateAccountResult {
  address: Address;
}

export const useCreateAccount = () => {
  const user = useUser();
  const [mutation] = useCreateAccountMutation();

  return async (name: string): Promise<CreateAccountResult> => {
    const r = await mutation({
      variables: {
        input: {
          name,
          policies: [
            {
              name: 'Admin',
              approvers: [user.address],
              permissions: {},
            },
          ],
        },
      },
      update: (cache, res) => {
        const account = res.data?.createAccount;
        if (!account) return;

        // Insert
        updateQuery<AccountIdsQuery, AccountIdsQueryVariables>({
          query: AccountIdsDocument,
          cache,
          variables: {},
          defaultData: { accounts: [] },
          updater: (data) => {
            if (!data.accounts.find((a) => a.address === account.address))
              data.accounts.push({
                __typename: 'Account',
                id: account.id,
                address: account.address,
              });
          },
        });
      },
    });

    const a = r.data?.createAccount;
    if (!a) throw new Error('Failed to create account');

    return a;
  };
};
