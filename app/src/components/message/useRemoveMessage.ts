import { FragmentType, gql, useFragment } from '@api';
import { useRouter } from 'expo-router';
import { useMutation } from 'urql';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';

const Message = gql(/* GraphQL */ `
  fragment useRemoveMessage_Message on Message {
    id
    signature
  }
`);

const Remove = gql(/* GraphQL */ `
  mutation useRemoveMessage_Remove($proposal: ID!) {
    removeMessage(input: { id: $proposal })
  }
`);

export function useRemoveMessage(messageFrag: FragmentType<typeof Message> | null | undefined) {
  const m = useFragment(Message, messageFrag);
  const router = useRouter();
  const account = useSelectedAccount();
  const remove = useMutation(Remove)[1];
  const confirmRemoval = useConfirmRemoval({
    message: 'Are you sure you want to remove this message proposal?',
  });

  if (!m || m.signature) return null;

  return async () => {
    if (await confirmRemoval()) {
      await remove({ proposal: m.id });
      account
        ? router.push({ pathname: '/(drawer)/[account]/(home)/activity', params: { account } })
        : router.back();
    }
  };
}
