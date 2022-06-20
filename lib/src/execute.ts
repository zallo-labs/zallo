import { BytesLike } from 'ethers';
import {
  Approverish,
  hashApprover,
  SafeApprover,
  toSafeApprover,
} from './approver';
import { Safe } from './contracts/Safe';
import { Group } from './group';
import { getMultiProof } from './merkle';
import { Op } from './op';
import { SignatureLike, toCompactSignature } from './signature';

export const EXECUTE_GAS_LIMIT = 50_000;
export const MULTI_EXECUTE_GAS_LIMIT = 100_000;

export type Signerish = Approverish & {
  signature: SignatureLike;
};

const split = (approversWithSigs: Signerish[]) =>
  approversWithSigs
    .map((s) => ({ signature: s.signature, ...toSafeApprover(s) }))
    .sort((a, b) => Buffer.compare(hashApprover(a), hashApprover(b)))
    .reduce(
      (acc, { signature, ...approver }) => {
        acc.approvers.push(approver);
        acc.signatures.push(toCompactSignature(signature));
        return acc;
      },
      { approvers: [] as SafeApprover[], signatures: [] as BytesLike[] },
    );

export const executeTx = async (
  safe: Safe,
  ops: Op | Op[],
  group: Group,
  signers: Signerish[],
) => {
  if (ops instanceof Array && ops.length === 1) ops = ops[0];

  const { approvers, signatures } = split(signers);
  const { proof, proofFlags } = getMultiProof(group, approvers);

  const args = [group.id, approvers, signatures, proof, proofFlags] as const;

  return ops instanceof Array
    ? safe.multiExecute(ops, ...args, { gasLimit: MULTI_EXECUTE_GAS_LIMIT })
    : safe.execute(ops, ...args, { gasLimit: EXECUTE_GAS_LIMIT });
};
