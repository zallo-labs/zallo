import { gql } from '@apollo/client';
import {
  AccountFieldsFragmentDoc,
  AccountIdsDocument,
  AccountIdsQuery,
  AccountIdsQueryVariables,
  useCreateAccountMutation,
} from '@api/generated';
import { updateQuery } from '~/gql/util';
import { Address } from 'lib';
import { useApproverAddress } from '@network/useApprover';

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
  const approver = useApproverAddress();
  const [mutation] = useCreateAccountMutation();

  return async (name: string): Promise<CreateAccountResult> => {
    const r = await mutation({
      variables: {
        input: {
          name,
          policies: [
            {
              name: 'Admin',
              approvers: [approver],
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
            if (!data.accounts.find((a) => a.id === account.id)) data.accounts.push(account);
          },
        });
      },
    });

    const a = r.data?.createAccount;
    if (!a) throw new Error('Failed to create account');

    return a;
  };
};
