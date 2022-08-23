import { gql, useMutation } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import {
  CommentsQuery,
  CommentsQueryVariables,
  DeleteCommentMutation,
  DeleteCommentMutationVariables,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { QueryOpts } from '~/gql/update';
import { useCallback } from 'react';
import { Comment, COMMENTS_QUERY } from '~/queries/useComments.api';
import { Address } from 'lib';

const MUTATION = gql`
  mutation DeleteComment($account: Address!, $key: Id!, $nonce: Int!) {
    deleteComment(account: $account, key: $key, nonce: $nonce) {
      id
    }
  }
`;

export const useDeleteComment = (account: Address) => {
  const device = useDevice();

  const [mutate] = useMutation<
    DeleteCommentMutation,
    DeleteCommentMutationVariables
  >(MUTATION, { client: useApiClient() });

  const del = useCallback(
    (c: Comment) => {
      if (c.author !== device.address)
        throw new Error("Can't delete comment that you didn't write");

      return mutate({
        variables: {
          account,
          key: c.key,
          nonce: c.nonce,
        },
        update: (cache, res) => {
          const id = res?.data?.deleteComment?.id;
          if (!id) return;

          const opts: QueryOpts<CommentsQueryVariables> = {
            query: COMMENTS_QUERY,
            variables: { account, key: c.key },
          };
          const data = cache.readQuery<CommentsQuery, CommentsQueryVariables>(
            opts,
          );

          cache.writeQuery<CommentsQuery, CommentsQueryVariables>({
            ...opts,
            overwrite: true,
            data: {
              comments: (data?.comments ?? []).filter((c) => c.id !== id),
            },
          });
        },
        optimisticResponse: {
          deleteComment: {
            __typename: 'Comment',
            id: c.id,
          },
        },
      });
    },
    [mutate, account, device.address],
  );

  return del;
};
