import { useRouter } from 'expo-router';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { useRemoveTransaction_transaction$key } from '~/api/__generated__/useRemoveTransaction_transaction.graphql';
import { useRemoveTransactionMutation } from '~/api/__generated__/useRemoveTransactionMutation.graphql';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';

const Transaction = graphql`
  fragment useRemoveTransaction_transaction on Transaction {
    id
    status
  }
`;

export interface RemoveTransactionParams {
  transaction: useRemoveTransaction_transaction$key;
}

export function useRemoveTransaction(params: RemoveTransactionParams) {
  const p = useFragment(Transaction, params.transaction);
  const router = useRouter();
  const account = useSelectedAccount();
  const confirmRemoval = useConfirmRemoval({
    message: 'Are you sure you want to remove this proposal?',
  });

  const commit = useMutation<useRemoveTransactionMutation>(
    graphql`
      mutation useRemoveTransactionMutation($proposal: ID!) @raw_response_type {
        removeTransaction(id: $proposal) @deleteRecord
      }
    `,
    { optimisticResponse: { removeTransaction: p.id } },
  );

  if (p.status !== 'Pending') return null;

  return async () => {
    if (!(await confirmRemoval())) return;

    await commit({ proposal: p.id });
    account
      ? router.push({ pathname: '/(nav)/[account]/(home)/activity', params: { account } })
      : router.back();
  };
}
