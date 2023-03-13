import { gql } from '@apollo/client';
import { CommentsDocument, CommentsQuery, CommentsQueryVariables } from '@api/generated';
import { asAddress } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { usePollWhenFocussed } from '~/gql/util';
import { useSuspenseQuery } from '~/gql/util';
import { Comment, Commentable, getCommentableId, Emoji } from './types';

gql`
  fragment CommentFields on Comment {
    id
    authorId
    content
    updatedAt
    reactions {
      userId
      emojis
    }
  }

  query Comments($account: Address!, $key: String!) {
    comments(account: $account, key: $key) {
      ...CommentFields
    }
  }
`;

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
