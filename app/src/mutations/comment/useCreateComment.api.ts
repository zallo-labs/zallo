import { gql, useMutation } from '@apollo/client';
import { useWallet } from '@features/wallet/useWallet';
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
import { useSelectedAccount } from '~/components2/account/useSelectedAccount';
import {
  COMMENT_FIELDS,
  Commentable,
  getCommentableKey,
  COMMENTS_QUERY,
} from '~/queries/useComments.api';

const MUTATION = gql`
  ${COMMENT_FIELDS}

  mutation CreateComment($safe: Address!, $key: Id!, $content: String!) {
    createComment(safe: $safe, key: $key, content: $content) {
      ...CommentFields
    }
  }
`;

export const createCommentId = (safe: Address, key: Id, nonce: number): Id =>
  toId(`${safe}-${key}-${nonce}`);

export const useCreateComment = (c: Commentable) => {
  const { safeAddr } = useSelectedAccount();
  const wallet = useWallet();
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
        variables: { safe: safeAddr, key },
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
          safe: safeAddr,
          key,
          content,
        },
        optimisticResponse: {
          createComment: {
            __typename: 'Comment',
            id: createCommentId(safeAddr, key, 0),
            safeId: safeAddr,
            key,
            nonce: 0,
            authorId: wallet.address,
            content,
            createdAt: now,
            updatedAt: now,
            reactions: [],
          },
        },
      });
    },
    [mutate, safeAddr, key, wallet.address],
  );

  return create;
};
