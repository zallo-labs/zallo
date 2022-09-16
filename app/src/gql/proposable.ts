import assert from 'assert';
import _ from 'lodash';
import { ProposalId } from '~/queries/proposal';

// eslint-disable-next-line @typescript-eslint/ban-types
type Obj = {};

export type ProposableStatus = 'active' | 'modify' | 'add' | 'remove';

export interface Active<T extends Obj> {
  active: T;
  proposed?: T | null;
  proposal?: ProposalId;
}

export interface Proposed<T extends Obj> {
  active?: T;
  proposed: T;
  proposal?: ProposalId;
}

export type Proposable<T extends Obj = Obj> = Active<T> | Proposed<T>;

export const isActive = <T extends Obj>(p: Proposable<T>): p is Active<T> =>
  p.active !== undefined;

export const isProposed = <T extends Obj>(p: Proposable<T>): p is Proposed<T> =>
  p.proposed !== undefined && p.proposed !== null;

export const latest = <T extends Obj>(proposable: Proposable<T>) =>
  isProposed(proposable) ? proposable.proposed : proposable.active;

export const mergeProposals = <T extends Obj>(
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

export const getProposableStatus = (p: Proposable): ProposableStatus => {
  if (!isActive(p)) return 'add';
  if (!isProposed(p)) return 'active';

  return p.proposed === null ? 'remove' : 'modify';
};

export const setProposed = <T extends Obj>(
  p: Proposable<T>,
  value: T | null,
) => {
  if (isActive(p)) p.proposed = value;
  if (_.isEqual(p.active, p.proposed)) p.proposed = undefined;

  return p;
};
