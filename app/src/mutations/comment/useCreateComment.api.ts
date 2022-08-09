import { gql, useMutation } from '@apollo/client';
import { useDevice } from '@features/device/useDevice';
import {
  CommentsQuery,
  CommentsQueryVariables,
  CreateCommentMutation,
  CreateCommentMutationVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { Address, Id, toId } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { useSelectedWallet } from '~/components2/wallet/useSelectedWallet';
import {
  COMMENT_FIELDS,
  Commentable,
  getCommentableKey,
  COMMENTS_QUERY,
} from '~/queries/useComments.api';

const MUTATION = gql`
  ${COMMENT_FIELDS}

  mutation CreateComment($account: Address!, $key: Id!, $content: String!) {
    createComment(account: $account, key: $key, content: $content) {
      ...CommentFields
    }
  }
`;

export const createCommentId = (account: Address, key: Id, nonce: number): Id =>
  toId(`${account}-${key}-${nonce}`);

export const useCreateComment = (c: Commentable) => {
  const { accountAddr } = useSelectedWallet();
  const device = useDevice();
  const key = getCommentableKey(c);

  const [mutate] = useMutation<
    CreateCommentMutation,
    CreateCommentMutationVariables
  >(MUTATION, {
    client: useApiClient(),
    update: (cache, res) => {
      const comment = res?.data?.createComment;
      if (!comment) return;

      const opts: QueryOpts<CommentsQueryVariables> = {
        query: COMMENTS_QUERY,
        variables: { account: accountAddr, key },
      };
      const data = cache.readQuery<CommentsQuery, CommentsQueryVariables>(opts);

      cache.writeQuery<CommentsQuery, CommentsQueryVariables>({
        ...opts,
        data: {
          comments: (data?.comments ?? []).concat(comment),
        },
      });
    },
  });

  const create = useCallback(
    (content: string) => {
      const now = DateTime.now().toISO();

      return mutate({
        variables: {
          account: accountAddr,
          key,
          content,
        },
        optimisticResponse: {
          createComment: {
            __typename: 'Comment',
            id: createCommentId(accountAddr, key, 0),
            accountId: accountAddr,
            key,
            nonce: 0,
            authorId: device.address,
            content,
            createdAt: now,
            updatedAt: now,
            reactions: [],
          },
        },
      });
    },
    [mutate, accountAddr, key, device.address],
  );

  return create;
};
