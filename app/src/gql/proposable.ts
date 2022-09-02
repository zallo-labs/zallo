import assert from 'assert';
import _ from 'lodash';
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

  const merged: Proposable<T> = { ...api, ...sub };
  if (_.isEqual(merged.proposed, merged.active)) {
    merged.proposed = undefined;
    merged.proposal = undefined;
  }

  return merged;
};

export const getProposableStatus = (
  p: Proposable<unknown>,
): ProposableStatus => {
  if (!isActive(p)) return 'add';
  if (!isProposed(p)) return 'active';

  return p.proposed === null ? 'remove' : 'modify';
};

export const setProposed = <T>(
  p: Proposable<NonNullable<T>>,
  value: NonNullable<T> | null,
) => {
  if (isActive(p)) p.proposed = value;
  if (_.isEqual(p.active, p.proposed)) p.proposed = undefined;

  return p;
};
