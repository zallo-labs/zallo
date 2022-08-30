import assert from 'assert';
import { TxId } from '~/queries/tx';
import { RequireAtLeastOne } from '~/util/typing';

export interface Active<T> {
  active: T;
}

export interface Proposed<T> {
  proposed: T | null;
}

export type Modified<T> = Active<T> & Proposed<T>;

export type Proposable<T> = RequireAtLeastOne<Active<T> & Proposed<T>> & {
  proposal?: TxId;
};

export const isActive = <T>(p: Proposable<T>): p is Active<T> => 'active' in p;

export const isProposed = <T>(p: Proposable<T>): p is Proposed<T> =>
  'proposed' in p;

export const isModified = <T>(p: Proposable<T>): p is Modified<T> =>
  isActive(p) && isProposed(p);

export const isAdded = <T>(p: Proposable<T>) =>
  isProposed(p) && p.proposed !== null;

export const isRemoved = <T>(p: Proposable<T>) =>
  isProposed(p) && p.proposed === null;

export const latest = <T>(proposable: Proposable<T>) =>
  isProposed(proposable) ? proposable.proposed : proposable.active;

export const mergeProposals = <T>(
  sub: Proposable<NonNullable<T>> | undefined,
  api: Proposable<NonNullable<T>> | undefined,
): Proposable<NonNullable<T>> => {
  assert(sub || api);
  if (!sub) return api!;
  if (!api) return sub!;

  return { ...api, ...sub };
};
