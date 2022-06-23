import { BytesLike, Overrides } from 'ethers';
import { merge } from 'lodash';
import { Address } from './addr';
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

// https://v2-docs.zksync.io/api/js/features.html#overrides
export interface zkOverrides {
  customData?: {
    feeToken?: Address;
  };
}

export type CombinedOverrides = Overrides & zkOverrides;

const defaultOverrides: CombinedOverrides = {
  gasLimit: 50000,
};

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
  overrides?: CombinedOverrides,
) => {
  if (ops instanceof Array && ops.length === 1) ops = ops[0];

  const { approvers, signatures } = split(signers);
  const { proof, proofFlags } = getMultiProof(group, approvers);

  const args = [
    group.ref,
    approvers,
    signatures,
    proof,
    proofFlags,
    merge(defaultOverrides, overrides),
  ] as const;

  return ops instanceof Array
    ? safe.multiExecute(ops, ...args)
    : safe.execute(ops, ...args);
};
