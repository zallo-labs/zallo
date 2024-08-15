import { Confirm } from '#/Confirm';
import { useRouter } from 'expo-router';
import { useFragment } from 'react-relay';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';
import { useMutation } from '~/api';
import { useRemoveMessage_account$key } from '~/api/__generated__/useRemoveMessage_account.graphql';
import { useRemoveMessage_message$key } from '~/api/__generated__/useRemoveMessage_message.graphql';
import {
  useRemoveMessageMutation,
  useRemoveMessageMutation$data,
} from '~/api/__generated__/useRemoveMessageMutation.graphql';
import { useRemoveMessageUpdatableQuery } from '~/api/__generated__/useRemoveMessageUpdatableQuery.graphql';

graphql`
  fragment useRemoveMessage_assignable_message on Message @assignable {
    __typename
  }
`;

const Account = graphql`
  fragment useRemoveMessage_account on Account {
    address
    proposals {
      id
      ...useRemoveMessage_assignable_message
    }
    pendingProposals: proposals(input: { pending: true }) {
      id
      ...useRemoveMessage_assignable_message
    }
  }
`;

const Message = graphql`
  fragment useRemoveMessage_message on Message {
    id
    signature
  }
`;

export interface RemoveMessageParams {
  account: useRemoveMessage_account$key;
  message: useRemoveMessage_message$key;
}

export function useRemoveMessage(params: RemoveMessageParams) {
  const account = useFragment(Account, params.account);
  const m = useFragment(Message, params.message);
  const router = useRouter();

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
    if (
      await Confirm.call({
        type: 'destructive',
        message: 'Are you sure you want to remove this message?',
      })
    ) {
      router.replace({
        pathname: '/(nav)/[account]/(home)/activity',
        params: { account: account.address },
      });

      const updater: SelectorStoreUpdater<useRemoveMessageMutation$data> = (store, data) => {
        const id = data?.removeMessage;
        if (!id) return;

        // Remove from proposals
        const { updatableData } = store.readUpdatableQuery<useRemoveMessageUpdatableQuery>(
          graphql`
            query useRemoveMessageUpdatableQuery($address: UAddress!) @updatable {
              account(address: $address) {
                proposals {
                  ...useProposeMessage_assignable_proposal
                }
                pendingProposals: proposals(input: { pending: true }) {
                  ...useProposeMessage_assignable_proposal
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
        { proposal: m.id },
        {
          optimisticResponse: { removeMessage: m.id },
          optimisticUpdater: updater,
          updater,
        },
      );
    }
  };
}
