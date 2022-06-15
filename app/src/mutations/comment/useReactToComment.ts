import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import {
  CommentsQuery,
  CommentsQueryVariables,
  ReactToComment,
  ReactToCommentVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { Address, Id, toId } from 'lib';
import { useCallback } from 'react';
import {
  Comment,
  COMMENTS_QUERY,
  REACTION_FIELDS,
} from '~/queries/useComments';
import { createCommentId } from './useCreateComment';

const MUTATION = apiGql`
${REACTION_FIELDS}

mutation ReactToComment($safe: Address!, $key: Id!, $nonce: Int!, $emojis: [String!]!) {
  reactToComment(safe: $safe, key: $key, nonce: $nonce, emojis: $emojis) {
    ...ReactionFields
  }
}
`;

export const createReactionId = (
  safe: Address,
  c: Comment,
  wallet: Address,
): Id => toId(`${createCommentId(safe, c.key, c.nonce)}-${wallet}`);

export const useReactToComments = () => {
  const { safe } = useSafe();
  const wallet = useWallet();

  const [mutate] = useMutation<ReactToComment, ReactToCommentVariables>(
    MUTATION,
    {
      client: useApiClient(),
    },
  );

  const react = useCallback(
    (c: Comment, emojis: string[]) =>
      mutate({
        variables: {
          safe: safe.address,
          key: c.key,
          nonce: c.nonce,
          emojis,
        },
        update: (cache, { data: { reactToComment } }) => {
          const opts: QueryOpts<CommentsQueryVariables> = {
            query: COMMENTS_QUERY,
            variables: { safe: safe.address, key: c.key },
          };
          const data = cache.readQuery<CommentsQuery, CommentsQueryVariables>(
            opts,
          );

          cache.writeQuery<CommentsQuery, CommentsQueryVariables>({
            ...opts,
            data: {
              comments: data.comments.map((comment) => {
                if (comment.id !== c.id) return comment;

                return {
                  ...comment,
                  reactions: [...comment.reactions, reactToComment],
                };
              }),
            },
          });
        },
        optimisticResponse: {
          reactToComment: {
            __typename: 'Reaction',
            id: createReactionId(safe.address, c, wallet.address),
            safeId: safe.address,
            key: c.key,
            nonce: c.nonce,
            approverId: wallet.address,
            emojis,
          },
        },
      }),
    [mutate, safe.address, wallet.address],
  );

  return react;
};
