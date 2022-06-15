import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import {
  CommentsQuery,
  CommentsQueryVariables,
  DeleteComment,
  DeleteCommentVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { useCallback } from 'react';
import { Comment, COMMENTS_QUERY } from '~/queries/useComments';

const MUTATION = apiGql`
mutation DeleteComment($safe: Address!, $key: Id!, $nonce: Int!) {
  deleteComment(safe: $safe, key: $key, nonce: $nonce) {
    id
  }
}
`;

export const useDeleteComment = () => {
  const { safe } = useSafe();

  const [mutate] = useMutation<DeleteComment, DeleteCommentVariables>(
    MUTATION,
    { client: useApiClient() },
  );

  const del = useCallback(
    (c: Comment) =>
      mutate({
        variables: {
          safe: safe.address,
          key: c.key,
          nonce: c.nonce,
        },
        update: (
          cache,
          {
            data: {
              deleteComment: { id },
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
              comments: data.comments.filter((c) => c.id === id),
            },
          });
        },
        optimisticResponse: {
          deleteComment: {
            __typename: 'Comment',
            id: c.id,
          },
        },
      }),
    [mutate, safe.address],
  );

  return del;
};
