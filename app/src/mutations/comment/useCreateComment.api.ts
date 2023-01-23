import { gql, useMutation } from '@apollo/client';
import {
  CommentsDocument,
  CommentsQuery,
  CommentsQueryVariables,
  CreateCommentDocument,
  CreateCommentMutation,
  CreateCommentMutationVariables,
} from '~/gql/generated.api';
import { QueryOpts } from '~/gql/update';
import { useCallback } from 'react';
import { Commentable, getCommentableId } from '~/queries/useComments.api';
import produce from 'immer';
import { DateTime } from 'luxon';
import _ from 'lodash';
import { useUser } from '~/queries/useUser.api';

gql`
  mutation CreateComment($account: Address!, $key: Id!, $content: String!) {
    createComment(account: $account, key: $key, content: $content) {
      id
    }
  }
`;

export const useCreateComment = () => {
  const user = useUser();

  const [mutate] = useMutation<CreateCommentMutation, CreateCommentMutationVariables>(
    CreateCommentDocument,
  );

  return useCallback(
    (commentable: Commentable, content: string) => {
      const id = getCommentableId(commentable);

      return mutate({
        variables: {
          ...id,
          content,
        },
        optimisticResponse: {
          createComment: {
            __typename: 'Comment',
            id: _.random(10000, 20000).toString(), // random and unqiue id, large enough to not be used
          },
        },
        update: (cache, res) => {
          const idStr = res?.data?.createComment.id;
          if (!idStr) return;

          // Comments: add
          const opts: QueryOpts<CommentsQueryVariables> = {
            query: CommentsDocument,
            variables: id,
          };
          const data = cache.readQuery<CommentsQuery, CommentsQueryVariables>(opts) ?? {
            comments: [],
          };

          cache.writeQuery<CommentsQuery>({
            ...opts,
            data: produce(data, (data) => {
              data.comments.push({
                id: idStr,
                authorId: user.id,
                content,
                updatedAt: DateTime.now().toISO(),
                reactions: [],
              });
            }),
          });
        },
      });
    },
    [mutate, user.id],
  );
};
