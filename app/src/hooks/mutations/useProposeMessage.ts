import { useMutation } from '~/api';
import { graphql, readInlineData } from 'relay-runtime';
import {
  ProposeMessageInput,
  useProposeMessageMutation,
} from '~/api/__generated__/useProposeMessageMutation.graphql';
import { useProposeMessage_account$key } from '~/api/__generated__/useProposeMessage_account.graphql';
import { useProposeMessageUpdatableQuery } from '~/api/__generated__/useProposeMessageUpdatableQuery.graphql';

graphql`
  fragment useProposeMessage_assignable_proposal on Message @assignable {
    __typename
  }
`;

export function useProposeMessage() {
  const commit = useMutation<useProposeMessageMutation>(graphql`
    mutation useProposeMessageMutation($input: ProposeMessageInput!) {
      proposeMessage(input: $input) {
        id
        signature
        ...useProposeMessage_assignable_proposal
        ...MessageItem_message
      }
    }
  `);

  return async (
    accountKey: useProposeMessage_account$key,
    input: Omit<ProposeMessageInput, 'account'>,
  ) => {
    const account = readInlineData(
      graphql`
        fragment useProposeMessage_account on Account @inline {
          address
          proposals {
            ...useProposeMessage_assignable_proposal
          }
          pendingProposals: proposals(input: { pending: true }) {
            ...useProposeMessage_assignable_proposal
          }
        }
      `,
      accountKey,
    );

    const r = await commit(
      { input: { ...input, account: account.address } },
      {
        updater: (store, data) => {
          const t = data?.proposeMessage;
          if (!t) return;

          // Prepend to Account.proposals
          const { updatableData } = store.readUpdatableQuery<useProposeMessageUpdatableQuery>(
            graphql`
              query useProposeMessageUpdatableQuery($address: UAddress!) @updatable {
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
            account,
          );

          if (updatableData.account) {
            // @ts-expect-error one __typename is 'string' the other is 'Message'
            updatableData.account.proposals = [t, ...account.proposals];
            // @ts-expect-error one __typename is 'string' the other is 'Message'
            updatableData.account.pendingProposals = [t, ...account.pendingProposals];
          }
        },
      },
    );
    return r.proposeMessage;
  };
}
