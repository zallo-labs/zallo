import { gql } from '@apollo/client';
import {
  AccountFieldsFragmentDoc,
  AccountsDocument,
  AccountsQuery,
  AccountsQueryVariables,
  useCreateAccountMutation,
} from '~/gql/generated.api';
import { Address, Quorum, toQuorumKey, asAddress } from 'lib';
import { useUser } from '~/queries/useUser.api';
import { updateQuery } from '~/gql/update';
import assert from 'assert';

gql`
  ${AccountFieldsFragmentDoc}

  mutation CreateAccount($name: String!, $quorums: [QuorumInput!]!) {
    createAccount(name: $name, quorums: $quorums) {
      ...AccountFields
    }
  }
`;

export interface CreateAccountResult {
  account: Address;
  quorums: Quorum[];
}

export const useCreateAccount = () => {
  const user = useUser();
  const [mutation] = useCreateAccountMutation();

  return async (name: string): Promise<CreateAccountResult> => {
    const quorums = [
      {
        name: 'Admin',
        key: toQuorumKey(1),
        approvers: new Set([user.id]),
      },
    ];

    const r = await mutation({
      variables: {
        name,
        quorums: quorums.map((q) => ({
          name: q.name,
          approvers: [...q.approvers.values()],
        })),
      },
      update: (cache, res) => {
        const account = res.data?.createAccount;
        if (!account) return;

        updateQuery<AccountsQuery, AccountsQueryVariables>({
          query: AccountsDocument,
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

    const account = asAddress(r.data?.createAccount.id);
    assert(account);
    return { account, quorums };
  };
};
