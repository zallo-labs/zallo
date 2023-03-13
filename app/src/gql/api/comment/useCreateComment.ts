import { gql, useMutation } from '@apollo/client';
import {
  CommentFieldsFragmentDoc,
  CommentsDocument,
  CommentsQuery,
  CommentsQueryVariables,
  CreateCommentDocument,
  CreateCommentMutation,
  CreateCommentMutationVariables,
} from '@api/generated';
import { updateQuery } from '~/gql/util';
import { useCallback } from 'react';
import { Commentable, getCommentableId } from './types';

gql`
  ${CommentFieldsFragmentDoc}

  mutation CreateComment($account: Address!, $key: String!, $content: String!) {
    createComment(account: $account, key: $key, content: $content) {
      ...CommentFields
    }
  }
`;

export const useCreateComment = () => {
  const [mutate] = useMutation<CreateCommentMutation, CreateCommentMutationVariables>(
    CreateCommentDocument,
  );

  return useCallback(
    (commentable: Commentable, content: string) => {
      const commentableId = getCommentableId(commentable);

      return mutate({
        variables: {
          ...commentableId,
          content,
        },
        update: (cache, res) => {
          const comment = res?.data?.createComment;
          if (!comment) return;

          updateQuery<CommentsQuery, CommentsQueryVariables>({
            query: CommentsDocument,
            cache,
            variables: commentableId,
            defaultData: { comments: [] },
            updater: (data) => {
              data.comments.push(comment);
            },
          });
        },
      });
    },
    [mutate],
  );
};
