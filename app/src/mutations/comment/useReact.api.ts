import { gql, useMutation } from '@apollo/client';
import {
  CommentsDocument,
  CommentsQuery,
  CommentsQueryVariables,
  ReactDocument,
  ReactMutation,
  ReactMutationVariables,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { QueryOpts } from '~/gql/update';
import { Address, Id, toId } from 'lib';
import { useCallback } from 'react';
import { Comment, Emoji } from '~/queries/useComments.api';
import produce from 'immer';
import assert from 'assert';
import { useUser } from '~/queries/useUser.api';

gql`
  mutation React($comment: Float!, $emojis: [String!]!) {
    reactToComment(id: $comment, emojis: $emojis) {
      id
    }
  }
`;

export const getReactionId = (c: Comment, user: Address): Id => toId(`${c.id}-${user}`);

export const useReact = (account: Address) => {
  const user = useUser();

  const [mutate] = useMutation<ReactMutation, ReactMutationVariables>(ReactDocument, {
    client: useApiClient(),
  });

  return useCallback(
    (c: Comment, emoji: Emoji) => {
      const emojisSet = c.reactions[user.id] ?? new Set();
      if (emojisSet.has(emoji)) {
        emojisSet.delete(emoji);
      } else {
        emojisSet.add(emoji);
      }
      const emojis = [...emojisSet.values()];

      return mutate({
        variables: {
          comment: c.id,
          emojis,
        },
        optimisticResponse: {
          reactToComment: {
            __typename: 'Reaction',
            id: getReactionId(c, user.id),
          },
        },
        update: (cache, res) => {
          const id = res?.data?.reactToComment?.id;
          if (!id) return;

          // Comments: add user reactions to comment
          const opts: QueryOpts<CommentsQueryVariables> = {
            query: CommentsDocument,
            variables: { account, key: c.key },
          };
          const data = cache.readQuery<CommentsQuery, CommentsQueryVariables>(opts);
          assert(data);

          cache.writeQuery<CommentsQuery, CommentsQueryVariables>({
            ...opts,
            overwrite: true,
            data: produce(data, (data) => {
              const comment = data.comments.find((c) => c.id === id);
              assert(comment);

              comment.reactions = [
                ...(comment.reactions ?? []).filter((r) => r.userId !== user.id),
                {
                  userId: user.id,
                  emojis,
                },
              ];
            }),
          });
        },
      });
    },
    [user.id, mutate, account],
  );
};
