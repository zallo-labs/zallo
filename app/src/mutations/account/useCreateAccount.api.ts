import { gql } from '@apollo/client';
import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
  QuorumStateFieldsFragment,
  useCreateAccountMutation,
} from '~/gql/generated.api';
import { address, Address, Quorum, toQuorumKey } from 'lib';
import { useUser } from '~/queries/useUser.api';

gql`
  mutation CreateAccount($name: String!, $quorums: [QuorumInput!]!) {
    createAccount(name: $name, quorums: $quorums) {
      id
      isActive
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
        const acc = res.data?.createAccount;
        if (!acc) return;

        {
          // Account: add
          cache.writeQuery<AccountQuery, AccountQueryVariables>({
            query: AccountDocument,
            variables: { account: acc.id },
            data: {
              account: {
                name,
                quorums: quorums.map((q) => {
                  const state: QuorumStateFieldsFragment = {
                    isRemoved: false,
                    createdAt: Date.now(),
                    spendingFallback: 'allow',
                    approvers: [...q.approvers.values()].map((a) => ({ userId: a })),
                  };

                  return {
                    id: `${acc.id}-${q.key}`,
                    accountId: acc.id,
                    key: q.key,
                    name: q.name,
                    ...(acc.isActive
                      ? {
                          activeState: state,
                          proposedStates: [],
                        }
                      : {
                          proposedStates: [state],
                        }),
                  };
                }),
                ...acc,
              },
            },
          });
        }
      },
    });

    return { account: address(r.data!.createAccount.id), quorums };
  };
};
