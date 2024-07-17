import { useMutation } from '~/api';
import { graphql, readInlineData } from 'relay-runtime';
import {
  ProposeTransactionInput,
  useProposeTransactionMutation,
} from '~/api/__generated__/useProposeTransactionMutation.graphql';
import { useProposeTransaction_account$key } from '~/api/__generated__/useProposeTransaction_account.graphql';
import { useProposeTransactionUpdatableQuery } from '~/api/__generated__/useProposeTransactionUpdatableQuery.graphql';

graphql`
  fragment useProposeTransaction_assignable_proposal on Transaction @assignable {
    __typename
  }
`;

export function useProposeTransaction() {
  const commit = useMutation<useProposeTransactionMutation>(graphql`
    mutation useProposeTransactionMutation($input: ProposeTransactionInput!) {
      proposeTransaction(input: $input) {
        id
        ...useProposeTransaction_assignable_proposal
        ...TransactionItem_transaction
      }
    }
  `);

  return async (
    accountKey: useProposeTransaction_account$key,
    input: Omit<ProposeTransactionInput, 'account'>,
  ) => {
    const account = readInlineData(
      graphql`
        fragment useProposeTransaction_account on Account @inline {
          address
          proposals {
            ...useProposeTransaction_assignable_proposal
          }
          pendingProposals: proposals(input: { pending: true }) {
            ...useProposeTransaction_assignable_proposal
          }
        }
      `,
      accountKey,
    );

    const r = await commit(
      { input: { ...input, account: account.address } },
      {
        updater: (store, data) => {
          const t = data?.proposeTransaction;
          if (!t) return;

          // Prepend to Account.proposals
          const { updatableData } = store.readUpdatableQuery<useProposeTransactionUpdatableQuery>(
            graphql`
              query useProposeTransactionUpdatableQuery($address: UAddress!) @updatable {
                account(address: $address) {
                  proposals {
                    ...useProposeTransaction_assignable_proposal
                  }
                  pendingProposals: proposals(input: { pending: true }) {
                    ...useProposeTransaction_assignable_proposal
                  }
                }
              }
            `,
            account,
          );

          if (updatableData.account) {
            // @ts-expect-error one __typename is 'string' the other is 'Transaction'
            updatableData.account.proposals = [t, ...account.proposals];
            // @ts-expect-error one __typename is 'string' the other is 'Transaction'
            updatableData.account.pendingProposals = [t, ...account.pendingProposals];
          }
        },
      },
    );
    return r.proposeTransaction.id;
  };
}
