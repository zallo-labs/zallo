import assert from 'assert';
import { TxId } from '~/queries/tx';
import { ProposableStatus } from '~/queries/wallets';

export interface Active<T> {
  active: T;
  proposed?: T | null;
  proposal?: TxId;
}

export interface Proposed<T> {
  active?: T;
  proposed: T;
  proposal?: TxId;
}

export type Proposable<T> = Active<T> | Proposed<T>;

export const isActive = <T>(p: Proposable<T>): p is Active<T> =>
  p.active !== undefined;

export const isProposed = <T>(p: Proposable<T>): p is Proposed<T> =>
  p.proposed !== undefined;

export const latest = <T>(proposable: Proposable<T>) =>
  isProposed(proposable) ? proposable.proposed : proposable.active;

export const mergeProposals = <T extends NonNullable<V>, V>(
  sub: Proposable<T> | undefined,
  api: Proposable<T> | undefined,
): Proposable<T> => {
  assert(sub || api);
  if (!sub) return api!;
  if (!api) return sub!;

  return { ...api, ...sub };
};

export const getProposableStatus = (p: Proposable<unknown>): ProposableStatus =>
  !isActive(p) ? 'add' : p.proposed === null ? 'remove' : 'active';
