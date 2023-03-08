import { gql } from '@apollo/client';
import { CommentsDocument, CommentsQuery, CommentsQueryVariables } from '~/gql/generated.api';
import { asAddress, Address, Id, toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { Proposal } from './proposal';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

gql`
  query Comments($account: Address!, $key: Id!) {
    comments(account: $account, key: $key) {
      id
      authorId
      content
      updatedAt
      reactions {
        userId
        emojis
      }
    }
  }
`;

export enum Emoji {
  LIKE = '👍',
  DISLIKE = '👎',
  HEART = '❤️',
  LAUGH = '😂',
}

export interface Comment {
  id: number;
  key: Id;
  author: Address;
  content: string;
  reactions: Record<Address, Set<Emoji>>;
  updatedAt: DateTime;
}

export type Commentable = Proposal; // | Transfer;

export const getCommentableId = (c: Commentable) => ({
  account: c.account,
  key: toId(`tx:${c.id}`),
});

export const useComments = (commentable: Commentable) => {
  const id = getCommentableId(commentable);

  const { data, ...rest } = useSuspenseQuery<CommentsQuery, CommentsQueryVariables>(
    CommentsDocument,
    { variables: id },
  );
  usePollWhenFocussed(rest, 3);

  const comments = useMemo(
    () =>
      data.comments.map(
        (c): Comment => ({
          id: parseFloat(c.id),
          key: id.key,
          author: asAddress(c.authorId),
          content: c.content,
          reactions: Object.fromEntries(
            (c.reactions ?? []).map(
              (r) => [asAddress(r.userId), new Set(r.emojis as Emoji[])] as const,
            ),
          ),
          updatedAt: DateTime.fromISO(c.updatedAt),
        }),
      ),
    [data.comments, id],
  );

  return [comments, rest] as const;
};
