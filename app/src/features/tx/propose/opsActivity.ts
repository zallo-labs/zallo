import { Id, isOp, Op, toId } from 'lib';
import { DateTime } from 'luxon';

export type OpsActivity = Op[] & {
  id: Id;
  timestamp: DateTime;
};

export const createOpsActivity = (ops: Op[]): OpsActivity => {
  const r = ops as OpsActivity;
  r.id = toId('ops');
  r.timestamp = DateTime.now();

  return r;
};

export const isOps = (e: unknown): e is Op[] =>
  Array.isArray(e) && e.every(isOp);
