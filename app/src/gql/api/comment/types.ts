import { Address } from 'lib';
import { DateTime } from 'luxon';
import { Proposal } from '../proposal';

export enum Emoji {
  LIKE = '👍',
  DISLIKE = '👎',
  HEART = '❤️',
  LAUGH = '😂',
}

export interface Comment {
  id: number;
  key: string;
  author: Address;
  content: string;
  reactions: Record<Address, Set<Emoji>>;
  updatedAt: DateTime;
}

export type Commentable = Proposal; // | Transfer;

export const getCommentableId = (c: Commentable) => ({
  account: c.account,
  key: `tx:${c.id}`,
});
