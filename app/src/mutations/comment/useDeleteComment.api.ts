import { gql, useMutation } from '@apollo/client';
import {
  CommentsDocument,
  CommentsQuery,
  CommentsQueryVariables,
  DeleteCommentDocument,
  DeleteCommentMutation,
  DeleteCommentMutationVariables,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { QueryOpts } from '~/gql/update';
import { useCallback } from 'react';
import { Comment } from '~/queries/useComments.api';
import { Address } from 'lib';
import { assert } from 'console';
import { useUser } from '~/queries/useUser.api';

gql`
  mutation DeleteComment($id: Float!) {
    deleteComment(id: $id) {
      id
    }
  }
`;

export const useDeleteComment = (account: Address) => {
  const user = useUser();

  const [mutate] = useMutation<DeleteCommentMutation, DeleteCommentMutationVariables>(
    DeleteCommentDocument,
    {
      client: useApiClient(),
    },
  );

  return useCallback(
    (c: Comment) => {
      assert(c.author === user.id);

      return mutate({
        variables: {
          id: c.id,
        },
        update: (cache, res) => {
          const id = res?.data?.deleteComment?.id;
          if (!id) return;

          // Comments: remove comment
          const opts: QueryOpts<CommentsQueryVariables> = {
            query: CommentsDocument,
            variables: { account, key: c.key },
          };

          const data = cache.readQuery<CommentsQuery>(opts);

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
            id: c.id.toString(),
          },
        },
      });
    },
    [user.id, mutate, account],
  );
};
