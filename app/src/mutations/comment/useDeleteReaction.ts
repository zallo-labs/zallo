import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import {
  CommentsQuery,
  CommentsQueryVariables,
  DeleteReaction,
  DeleteReactionVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { useCallback } from 'react';
import { Comment, COMMENTS_QUERY, Reaction } from '~/queries/useComments';
import { createReactionId } from './useReactToComment';

const MUTATION = apiGql`
mutation DeleteReaction($safe: Address!, $key: Id!, $nonce: Int!) {
  deleteReaction(safe: $safe, key: $key, nonce: $nonce) {
    id
  }
}
`;

export const useDeleteReaction = () => {
  const { safe } = useSafe();
  const wallet = useWallet();

  const [mutation] = useMutation<DeleteReaction, DeleteReactionVariables>(
    MUTATION,
    { client: useApiClient() },
  );

  const del = useCallback(
    (c: Comment) =>
      mutation({
        variables: {
          safe: safe.address,
          key: c.key,
          nonce: c.nonce,
        },
        update: (
          cache,
          {
            data: {
              deleteReaction: { id },
            },
          },
        ) => {
          const opts: QueryOpts<CommentsQueryVariables> = {
            query: COMMENTS_QUERY,
            variables: { safe: safe.address, key: c.key },
          };
          const data = cache.readQuery<CommentsQuery, CommentsQueryVariables>(
            opts,
          );

          cache.writeQuery<CommentsQuery, CommentsQueryVariables>({
            ...opts,
            overwrite: true,
            data: {
              comments: data.comments.map((comment) => {
                if (comment.id !== c.id) return comment;

                return {
                  ...comment,
                  reactions: comment.reactions.filter((r) => r.id !== id),
                };
              }),
            },
          });
        },
        optimisticResponse: {
          deleteReaction: {
            __typename: 'Reaction',
            id: createReactionId(safe.address, c, wallet.address),
          },
        },
      }),
    [mutation, safe.address, wallet.address],
  );

  return del;
};
