import { verifyTargetsPermission, verifyTransfersPermission } from './permissions';
import { verifyOtherMessagePermission } from './permissions/OtherMessagePermission';
import { Policy } from './policy';
import { Tx } from './tx';

export type PermissionValidation = true | string;
export type ValidationError = { reason: string; operation?: number };

export function validateTransaction(p: Policy, tx: Tx): ValidationError[] {
  return [
    ...tx.operations.map(
      (op, i) => [verifyTargetsPermission(p.permissions.targets, op), i] as const,
    ),
    ...tx.operations.map(
      (op, i) => [verifyTransfersPermission(p.permissions.transfers, op), i] as const,
    ),
  ].reduce<ValidationError[]>((acc, [result, op]) => {
    if (result !== true) acc.push({ reason: result, operation: op });
    return acc;
  }, []);
}

export type MessagePermissionVerifier = [handled: boolean, result: PermissionValidation];

export function validateMessage(p: Policy): ValidationError[] {
  let handled = false;
  const functions = [() => verifyOtherMessagePermission(p.permissions.otherMessage, handled)];

  return functions.reduce<ValidationError[]>((acc, f) => {
    const [funcHandled, result] = f();
    handled ||= funcHandled;

    if (result !== true) acc.push({ reason: result });
    return acc;
  }, []);
}
