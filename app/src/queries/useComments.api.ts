import { gql, useQuery } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { CommentsQuery, CommentsQueryVariables } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { address, Address, Id, toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { isTransfer, Transfer } from './tx/transfer.sub';
import { Activity } from '@features/activity/ActivityItem';
import { isTx, Tx } from './tx';

export const REACTION_FIELDS = gql`
  fragment ReactionFields on Reaction {
    id
    safeId
    key
    nonce
    userId
    emojis
  }
`;

export const COMMENT_FIELDS = gql`
  ${REACTION_FIELDS}

  fragment CommentFields on Comment {
    id
    safeId
    key
    nonce
    authorId
    content
    createdAt
    updatedAt
    reactions {
      ...ReactionFields
    }
  }
`;

export const COMMENTS_QUERY = gql`
  ${COMMENT_FIELDS}

  query Comments($safe: Address!, $key: Id!) {
    comments(safe: $safe, key: $key) {
      ...CommentFields
    }
  }
`;

export interface Comment {
  id: Id;
  key: Id;
  nonce: number;
  author: Address;
  content: string;
  reactions: Reaction[];
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface Reaction {
  user: Address;
  emojis: string[];
}

export type Commentable = Tx | Transfer;

export const isCommentable = (e: Activity): e is Commentable =>
  isTx(e) || isTransfer(e);

export const getCommentableKey = (c: Commentable): Id => toId(`tx:${c.id}`);

export const useComments = (commentable: Commentable) => {
  const { safe } = useSafe();
  const key = getCommentableKey(commentable);

  const { data, ...rest } = useQuery<CommentsQuery, CommentsQueryVariables>(
    COMMENTS_QUERY,
    {
      client: useApiClient(),
      variables: {
        safe: safe.address,
        key,
      },
      pollInterval: 3 * 1000,
    },
  );

  const comments: Comment[] = useMemo(
    () =>
      data?.comments.map(
        (c): Comment => ({
          id: toId(c.id),
          key: toId(c.key),
          nonce: c.nonce,
          author: address(c.authorId),
          content: c.content,
          reactions: (c.reactions ?? []).map(
            (r): Reaction => ({
              user: address(r.userId),
              emojis: r.emojis ?? [],
            }),
          ),
          createdAt: DateTime.fromISO(c.createdAt),
          updatedAt: DateTime.fromISO(c.updatedAt),
        }),
      ) ?? [],
    [data],
  );

  return { comments, ...rest };
};
