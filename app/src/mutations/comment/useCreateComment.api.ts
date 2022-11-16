import { gql, useMutation } from '@apollo/client';
import {
  CommentsDocument,
  CommentsQuery,
  CommentsQueryVariables,
  CreateCommentDocument,
  CreateCommentMutation,
  CreateCommentMutationVariables,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { QueryOpts } from '~/gql/update';
import { Address } from 'lib';
import { useCallback } from 'react';
import { Commentable, getCommentableKey } from '~/queries/useComments.api';
import produce from 'immer';
import { useDevice } from '@network/useDevice';
import { DateTime } from 'luxon';
import _ from 'lodash';

gql`
  mutation CreateComment($account: Address!, $key: Id!, $content: String!) {
    createComment(account: $account, key: $key, content: $content) {
      id
    }
  }
`;

export const useCreateComment = (commentable: Commentable, account: Address) => {
  const device = useDevice();

  const [mutate] = useMutation<CreateCommentMutation, CreateCommentMutationVariables>(
    CreateCommentDocument,
    {
      client: useApiClient(),
    },
  );

  return useCallback(
    (content: string) => {
      const key = getCommentableKey(commentable);

      return mutate({
        variables: {
          account,
          key,
          content,
        },
        optimisticResponse: {
          createComment: {
            __typename: 'Comment',
            id: _.random(10000, 20000).toString(), // random and unqiue id, large enough to not be used
          },
        },
        update: (cache, res) => {
          const id = res?.data?.createComment.id;
          if (!id) return;

          // Comments: add
          const opts: QueryOpts<CommentsQueryVariables> = {
            query: CommentsDocument,
            variables: { account, key },
          };
          const data = cache.readQuery<CommentsQuery, CommentsQueryVariables>(opts) ?? {
            comments: [],
          };

          cache.writeQuery<CommentsQuery>({
            ...opts,
            data: produce(data, (data) => {
              data.comments.push({
                id,
                authorId: device.address,
                content,
                updatedAt: DateTime.now().toISO(),
                reactions: [],
              });
            }),
          });
        },
      });
    },
    [commentable, mutate, account, device.address],
  );
};
