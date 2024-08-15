import { Confirm } from '#/Confirm';
import { useRouter } from 'expo-router';
import { useFragment } from 'react-relay';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';
import { useMutation } from '~/api';
import { useRemoveTransaction_transaction$key } from '~/api/__generated__/useRemoveTransaction_transaction.graphql';
import {
  useRemoveTransactionMutation,
  useRemoveTransactionMutation$data,
} from '~/api/__generated__/useRemoveTransactionMutation.graphql';
import { useRemoveTransactionUpdatableQuery } from '~/api/__generated__/useRemoveTransactionUpdatableQuery.graphql';

graphql`
  fragment useRemoveTransaction_assignable_transaction on Transaction @assignable {
    __typename
  }
`;

const Transaction = graphql`
  fragment useRemoveTransaction_transaction on Transaction {
    id
    status
    account {
      address
      proposals {
        id
        ...useRemoveTransaction_assignable_transaction
      }
      pendingProposals: proposals(input: { pending: true }) {
        id
        ...useRemoveTransaction_assignable_transaction
      }
    }
  }
`;

export interface RemoveTransactionParams {
  transaction: useRemoveTransaction_transaction$key;
}

export function useRemoveTransaction(params: RemoveTransactionParams) {
  const t = useFragment(Transaction, params.transaction);
  const router = useRouter();

  const commit = useMutation<useRemoveTransactionMutation>(graphql`
    mutation useRemoveTransactionMutation($proposal: ID!) @raw_response_type {
      removeTransaction(id: $proposal) @deleteRecord
    }
  `);

  if (t.status !== 'Pending') return null;

  return async () => {
    if (
      !(await Confirm.call({
        type: 'destructive',
        message: 'Are you sure you want to remove this transaction?',
      }))
    )
      return;

    router.replace({
      pathname: '/(nav)/[account]/(home)/activity',
      params: { account: t.account.address },
    });

    const updater: SelectorStoreUpdater<useRemoveTransactionMutation$data> = (store, data) => {
      const id = data?.removeTransaction;
      if (!id) return;

      // Prepend to proposals
      const { updatableData } = store.readUpdatableQuery<useRemoveTransactionUpdatableQuery>(
        graphql`
          query useRemoveTransactionUpdatableQuery($address: UAddress!) @updatable {
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
        { address: t.account.address },
      );

      if (updatableData.account) {
        // @ts-expect-error one __typename is 'string' the other is 'Transaction'
        updatableData.account.proposals = t.account.proposals.filter((p) => p.id !== id);
        // @ts-expect-error one __typename is 'string' the other is 'Transaction'
        updatableData.account.pendingProposals = t.account.pendingProposals.filter(
          (p) => p.id !== id,
        );
      }
    };

    await commit(
      { proposal: t.id },
      {
        optimisticResponse: { removeTransaction: t.id },
        optimisticUpdater: updater,
        updater,
      },
    );
  };
}
