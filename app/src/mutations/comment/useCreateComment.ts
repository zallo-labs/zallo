import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import {
  CommentsQuery,
  CommentsQueryVariables,
  CreateComment,
  CreateCommentVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { Address, Id, toId } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import {
  Commentable,
  COMMENTS_QUERY,
  COMMENT_FIELDS,
  getCommentableKey,
} from '~/queries/useComments';

const MUTATION = apiGql`
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
  const { safe } = useSafe();
  const wallet = useWallet();
  const key = getCommentableKey(c);

  const [mutate] = useMutation<CreateComment, CreateCommentVariables>(
    MUTATION,
    {
      client: useApiClient(),
      update: (cache, res) => {
        const comment = res?.data?.createComment;
        if (!comment) return;

        const opts: QueryOpts<CommentsQueryVariables> = {
          query: COMMENTS_QUERY,
          variables: { safe: safe.address, key },
        };
        const data = cache.readQuery<CommentsQuery, CommentsQueryVariables>(
          opts,
        );

        cache.writeQuery<CommentsQuery, CommentsQueryVariables>({
          ...opts,
          data: {
            comments: (data?.comments ?? []).concat(comment),
          },
        });
      },
    },
  );

  const create = useCallback(
    (content: string) => {
      const now = DateTime.now().toISO();

      return mutate({
        variables: {
          safe: safe.address,
          key,
          content,
        },
        optimisticResponse: {
          createComment: {
            __typename: 'Comment',
            id: createCommentId(safe.address, key, 0),
            safeId: safe.address,
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
    [mutate, safe.address, key, wallet.address],
  );

  return create;
};
