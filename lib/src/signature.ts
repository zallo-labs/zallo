import { BigNumber, BytesLike, ethers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import {
  Approverish,
  hashApprover,
  SafeApprover,
  toSafeApprover,
} from './approver';
import { BoolArray } from './boolArray';
import { ApproverStruct } from './contracts/contracts/ISafe';
import { Groupish } from './group';
import { getMultiProof } from './merkle';

export type SignatureLike = Parameters<typeof ethers.utils.splitSignature>[0];

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

interface TxSignature {
  groupRef: BytesLike;
  approvers: SafeApprover[];
  signatures: BytesLike[];
  proof: BytesLike[];
  proofFlags: BoolArray;
}

export const createTxSignature = (
  group: Groupish,
  signers: Signerish[],
): BytesLike => {
  const { approvers, signatures } = split(signers);
  const { proof, proofFlags } = getMultiProof(group, approvers);

  return defaultAbiCoder.encode(
    [
      '(bytes32 groupRef, (address addr, uint96 weight)[] approvers, bytes[] signatures, bytes32[] proof, uint256[] proofFlags)',
    ],
    [
      {
        groupRef: group.ref,
        approvers,
        signatures,
        proof,
        proofFlags,
      } as TxSignature,
    ],
  );
};

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2098.md
export const toCompactSignature = (signature: SignatureLike) =>
  ethers.utils.splitSignature(signature).compact;
