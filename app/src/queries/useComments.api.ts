import { gql } from '@apollo/client';
import {
  CommentsDocument,
  CommentsQuery,
  CommentsQueryVariables,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { address, Address, Id, toId } from 'lib';
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
        deviceId
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

export const getCommentableKey = (c: Commentable): Id => toId(`tx:${c.id}`);

export const useComments = (commentable: Commentable) => {
  const key = getCommentableKey(commentable);

  const { data, ...rest } = useSuspenseQuery<
    CommentsQuery,
    CommentsQueryVariables
  >(CommentsDocument, {
    client: useApiClient(),
    variables: {
      account: commentable.account,
      key,
    },
  });
  usePollWhenFocussed(rest, 3);

  const comments = useMemo(
    () =>
      data.comments.map(
        (c): Comment => ({
          id: parseFloat(c.id),
          key,
          author: address(c.authorId),
          content: c.content,
          reactions: Object.fromEntries(
            (c.reactions ?? []).map(
              (r) =>
                [address(r.deviceId), new Set(r.emojis as Emoji[])] as const,
            ),
          ),
          updatedAt: DateTime.fromISO(c.updatedAt),
        }),
      ),
    [data.comments, key],
  );

  return [comments, rest] as const;
};
