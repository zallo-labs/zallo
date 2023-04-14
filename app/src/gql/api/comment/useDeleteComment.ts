import { gql } from '@apollo/client';
import {
  CommentsDocument,
  CommentsQuery,
  CommentsQueryVariables,
  useDeleteCommentMutation,
} from '@api/generated';
import { updateQuery } from '~/gql/util';
import { useCallback } from 'react';
import { Comment } from './types';
import assert from 'assert';
import { useUser } from '@api/user';
import { AccountId } from '@api/account';

gql`
  mutation DeleteComment($id: Float!) {
    deleteComment(id: $id) {
      id
    }
  }
`;

export const useDeleteComment = (account: AccountId) => {
  const user = useUser();
  const [mutate] = useDeleteCommentMutation();

  return useCallback(
    (c: Comment) => {
      assert(c.author === user.id);

      return mutate({
        variables: {
          id: c.id,
        },
        optimisticResponse: {
          deleteComment: {
            __typename: 'Comment',
            id: c.id,
          },
        },
        update: (cache, res) => {
          const id = res?.data?.deleteComment?.id;
          if (!id) return;

          updateQuery<CommentsQuery, CommentsQueryVariables>({
            query: CommentsDocument,
            cache,
            variables: { account, key: c.key },
            updater: (data) => {
              data.comments = data.comments.filter((c) => c.id !== id);
            },
          });
        },
      });
    },
    [user.id, mutate, account],
  );
};
