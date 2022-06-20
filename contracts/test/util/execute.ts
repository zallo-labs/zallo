import {
  Approver,
  createOp,
  executeTx,
  Group,
  mapAsync,
  Op,
  Safe,
  signTx,
} from 'lib';
import { allSigners } from './wallet';

export const execute = async (
  safe: Safe,
  group: Group,
  approvers: Approver[],
  ...opDefs: Partial<Op>[]
) => {
  const ops = opDefs.map(createOp);

  const approversWithSigs = await mapAsync(approvers, async (approver) => ({
    ...approver,
    signature: await signTx(
      allSigners.find((w) => w.address === approver.addr)!,
      safe.address,
      ...ops,
    ),
  }));

  return await executeTx(safe, ops, group, approversWithSigs);
};
