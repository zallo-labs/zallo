import { Address } from 'viem';
import { verifyTargetsPermission, verifyTransfersPermission } from './permissions';
import { Policy } from './policy';
import { Tx } from './tx';

export type SatisfiabilityResult =
  | { result: 'satisfied'; reason?: never; operation?: number }
  | { result: 'satisfiable'; reason: string; operation?: number }
  | { result: 'unsatisfiable'; reason: string; operation?: number };

export type TransactionSatisfiabilityResult =
  | { result: 'satisfied'; reason?: never }
  | { result: 'satisfiable'; reasons: { reason: string; operation?: number }[] }
  | { result: 'unsatisfiable'; reasons: { reason: string; operation?: number }[] };

export const getTransactionSatisfiability = (
  p: Policy,
  tx: Tx,
  approvals: Set<Address>,
): TransactionSatisfiabilityResult => {
  const r = [
    ...tx.operations.map((op, i) => ({
      ...verifyTargetsPermission(p.permissions.targets, op),
      operation: i,
    })),
    ...tx.operations.map((op, i) => ({
      ...verifyTransfersPermission(p.permissions.transfers, op),
      operation: i,
    })),
    verifyApprovals(p, approvals),
  ];

  const unsatisfiable = r.filter((v) => v.result === 'unsatisfiable');
  if (unsatisfiable.length)
    return {
      result: 'unsatisfiable',
      reasons: unsatisfiable.map((v) => ({ reason: v.reason!, operation: v.operation })),
    };

  const satisfiable = r.filter((v) => v.result === 'satisfiable');
  if (satisfiable.length)
    return {
      result: 'satisfiable',
      reasons: satisfiable.map((v) => ({ reason: v.reason!, operation: v.operation })),
    };

  return { result: 'satisfied' };
};

const verifyApprovals = (
  { approvers, threshold }: Policy,
  approvals: Set<Address>,
): SatisfiabilityResult => {
  const nApprovals = new Set([...approvals].filter((v) => approvers.has(v)));

  return nApprovals.size >= threshold
    ? { result: 'satisfied' }
    : { result: 'satisfiable', reason: 'Awaiting approvals' };
};
