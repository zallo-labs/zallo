import { useRouter } from 'expo-router';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { useRemoveTransaction_transaction$key } from '~/api/__generated__/useRemoveTransaction_transaction.graphql';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';

const Transaction = graphql`
  fragment useRemoveTransaction_transaction on Transaction {
    id
    status
  }
`;

const Remove = graphql`
  mutation useRemoveTransactionMutation($proposal: ID!) {
    removeTransaction(input: { id: $proposal }) @deleteRecord
  }
`;

export function useRemoveTransaction(
  proposalFrag: useRemoveTransaction_transaction$key | null | undefined,
) {
  const p = useFragment(Transaction, proposalFrag);
  const router = useRouter();
  const account = useSelectedAccount();
  const remove = useMutation(Remove);
  const confirmRemoval = useConfirmRemoval({
    message: 'Are you sure you want to remove this proposal?',
  });

  if (!p || p.status !== 'Pending') return null;

  return async () => {
    if (await confirmRemoval()) {
      await remove({ proposal: p.id });
      account
        ? router.push({ pathname: '/(nav)/[account]/(home)/activity', params: { account } })
        : router.back();
    }
  };
}
