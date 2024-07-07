import { useRouter } from 'expo-router';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { useRemoveMessage_message$key } from '~/api/__generated__/useRemoveMessage_message.graphql';
import { useRemoveMessageMutation } from '~/api/__generated__/useRemoveMessageMutation.graphql';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';

const Message = graphql`
  fragment useRemoveMessage_message on Message {
    id
    signature
  }
`;

export function useRemoveMessage(messageFrag: useRemoveMessage_message$key) {
  const m = useFragment(Message, messageFrag);
  const router = useRouter();
  const account = useSelectedAccount();
  const confirmRemoval = useConfirmRemoval({
    message: 'Are you sure you want to remove this message proposal?',
  });

  const commit = useMutation<useRemoveMessageMutation>(
    graphql`
      mutation useRemoveMessageMutation($proposal: ID!) @raw_response_type {
        removeMessage(input: { id: $proposal }) @deleteRecord
      }
    `,
    { optimisticResponse: { removeMessage: m.id } },
  );

  if (m.signature) return null;

  return async () => {
    if (await confirmRemoval()) {
      await commit({ proposal: m.id });

      account
        ? router.push({ pathname: '/(nav)/[account]/(home)/activity', params: { account } })
        : router.back();
    }
  };
}
