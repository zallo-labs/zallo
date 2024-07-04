import { useRouter } from 'expo-router';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { useRemoveMessage_message$key } from '~/api/__generated__/useRemoveMessage_message.graphql';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';

const Message = graphql`
  fragment useRemoveMessage_message on Message {
    id
    signature
  }
`;

const Remove = graphql`
  mutation useRemoveMessageMutation($proposal: ID!) {
    removeMessage(input: { id: $proposal }) @deleteRecord
  }
`;

export function useRemoveMessage(messageFrag: useRemoveMessage_message$key | null | undefined) {
  const m = useFragment(Message, messageFrag);
  const router = useRouter();
  const account = useSelectedAccount();
  const remove = useMutation(Remove);
  const confirmRemoval = useConfirmRemoval({
    message: 'Are you sure you want to remove this message proposal?',
  });

  if (!m || m.signature) return null;

  return async () => {
    if (await confirmRemoval()) {
      await remove({ proposal: m.id });
      account
        ? router.push({ pathname: '/(nav)/[account]/(home)/activity', params: { account } })
        : router.back();
    }
  };
}
