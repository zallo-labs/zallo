import { useRouter } from 'expo-router';
import { useFragment } from 'react-relay';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';
import { useMutation } from '~/api';
import { useRemoveTransaction_account$key } from '~/api/__generated__/useRemoveTransaction_account.graphql';
import { useRemoveTransaction_transaction$key } from '~/api/__generated__/useRemoveTransaction_transaction.graphql';
import {
  useRemoveTransactionMutation,
  useRemoveTransactionMutation$data,
} from '~/api/__generated__/useRemoveTransactionMutation.graphql';
import { useRemoveTransactionUpdatableQuery } from '~/api/__generated__/useRemoveTransactionUpdatableQuery.graphql';
import { useConfirmRemoval } from '~/hooks/useConfirm';

graphql`
  fragment useRemoveTransaction_assignable_transaction on Transaction @assignable {
    __typename
  }
`;

const Account = graphql`
  fragment useRemoveTransaction_account on Account {
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
`;

const Transaction = graphql`
  fragment useRemoveTransaction_transaction on Transaction {
    id
    status
  }
`;

export interface RemoveTransactionParams {
  account: useRemoveTransaction_account$key;
  transaction: useRemoveTransaction_transaction$key;
}

export function useRemoveTransaction(params: RemoveTransactionParams) {
  const account = useFragment(Account, params.account);
  const p = useFragment(Transaction, params.transaction);
  const router = useRouter();
  const confirmRemoval = useConfirmRemoval({
    message: 'Are you sure you want to remove this proposal?',
  });

  const commit = useMutation<useRemoveTransactionMutation>(graphql`
    mutation useRemoveTransactionMutation($proposal: ID!) @raw_response_type {
      removeTransaction(id: $proposal) @deleteRecord
    }
  `);

  if (p.status !== 'Pending') return null;

  return async () => {
    if (!(await confirmRemoval())) return;

    router.replace({
      pathname: '/(nav)/[account]/(home)/activity',
      params: { account: account.address },
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
        { address: account.address },
      );

      if (updatableData.account) {
        // @ts-expect-error one __typename is 'string' the other is 'Transaction'
        updatableData.account.proposals = account.proposals.filter((p) => p.id !== id);
        // @ts-expect-error one __typename is 'string' the other is 'Transaction'
        updatableData.account.pendingProposals = account.pendingProposals.filter(
          (p) => p.id !== id,
        );
      }
    };

    await commit(
      { proposal: p.id },
      {
        optimisticResponse: { removeTransaction: p.id },
        optimisticUpdater: updater,
        updater,
      },
    );
  };
}
