import { FragmentType, gql, useFragment } from '@api';
import { useRouter } from 'expo-router';
import { useMutation } from 'urql';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';

const Transaction = gql(/* GraphQL */ `
  fragment useRemoveTransaction_Transaction on Transaction {
    id
    status
  }
`);

const Remove = gql(/* GraphQL */ `
  mutation UseRemoveTransaction_Remove($proposal: ID!) {
    removeTransaction(input: { id: $proposal })
  }
`);

export function useRemoveTransaction(
  proposalFrag: FragmentType<typeof Transaction> | null | undefined,
) {
  const p = useFragment(Transaction, proposalFrag);
  const router = useRouter();
  const account = useSelectedAccount();
  const remove = useMutation(Remove)[1];
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
