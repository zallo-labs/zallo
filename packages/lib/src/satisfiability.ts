import { Address } from './address';
import { verifyTargetsPermission, verifyTransfersPermission } from './permissions';
import { verifyOtherMessagePermission } from './permissions/OtherMessagePermission';
import { Policy } from './policy';
import { Tx } from './tx';

export enum Satisfiability {
  unsatisfiable = 'unsatisfiable',
  satisfiable = 'satisfiable',
  satisfied = 'satisfied',
}

export interface SatisfiabilityResult {
  result: Satisfiability;
  reasons: SatisfiabilityReason[];
}

export interface SatisfiabilityReason {
  reason: string;
  operation?: number;
}

export const getTransactionSatisfiability = (
  p: Policy,
  tx: Tx,
  approvals: Set<Address>,
): SatisfiabilityResult => {
  const r = [
    verifyApprovals(p, approvals),
    ...tx.operations.map((op, i) => ({
      ...verifyTargetsPermission(p.permissions.targets, op),
      operation: i,
    })),
    ...tx.operations.map((op, i) => ({
      ...verifyTransfersPermission(p.permissions.transfers, op),
      operation: i,
    })),
  ];

  const unsatisfiable = r.filter((v) => v.result === 'unsatisfiable');
  if (unsatisfiable.length)
    return {
      result: Satisfiability.unsatisfiable,
      reasons: unsatisfiable.map((v) => ({ reason: v.reason!, operation: v.operation })),
    };

  const satisfiable = r.filter((v) => v.result === 'satisfiable');
  if (satisfiable.length)
    return {
      result: Satisfiability.satisfiable,
      reasons: satisfiable.map((v) => ({ reason: v.reason!, operation: v.operation })),
    };

  return { result: Satisfiability.satisfied, reasons: [] };
};

export type OperationSatisfiability =
  | { result: 'satisfied'; reason?: never; operation?: number }
  | { result: 'satisfiable'; reason: string; operation?: number }
  | { result: 'unsatisfiable'; reason: string; operation?: number };

export const verifyApprovals = (
  { approvers, threshold }: Policy,
  approvals: Set<Address>,
): OperationSatisfiability => {
  const nApprovals = new Set([...approvals].filter((v) => approvers.has(v)));

  return nApprovals.size >= threshold
    ? { result: 'satisfied' }
    : { result: 'satisfiable', reason: 'Awaiting approvals' };
};

export type MessagePermissionVerifier = [handled: boolean, result: OperationSatisfiability];

export const getMessageSatisfiability = (
  p: Policy,
  approvals: Set<Address>,
): SatisfiabilityResult => {
  let handled = false;
  const functions = [
    () => [false, verifyApprovals(p, approvals)] as const,
    () => verifyOtherMessagePermission(p.permissions.otherMessage, handled),
  ];

  const results = functions.map((f) => {
    const [funcHandled, result] = f();
    handled ||= funcHandled;
    return result;
  });

  const unsatisfiable = results.filter((v) => v.result === 'unsatisfiable');
  if (unsatisfiable.length)
    return {
      result: Satisfiability.unsatisfiable,
      reasons: unsatisfiable.map((v) => ({ reason: v.reason!, operation: v.operation })),
    };

  const satisfiable = results.filter((v) => v.result === 'satisfiable');
  if (satisfiable.length)
    return {
      result: Satisfiability.satisfiable,
      reasons: satisfiable.map((v) => ({ reason: v.reason!, operation: v.operation })),
    };

  return { result: Satisfiability.satisfied, reasons: [] };
};
