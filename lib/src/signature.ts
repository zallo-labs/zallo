import { BytesLike, ethers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { SignatureLike } from '@ethersproject/bytes';
import { Address, compareAddress } from './address';
import { Approver } from './approver';
import { POLICY_ABI, Policy } from './policy';
import { hashTx, Tx } from './tx';
import { asHex } from './bytes';
import { ApprovalsStruct } from './contracts/TestVerifier';
import { newAbiType } from './util/abi';

// Convert to a compact 64 byte (eip-2098) signature
export const toCompactSignature = (signature: SignatureLike) =>
  ethers.utils.splitSignature(signature).compact;

export interface Approval {
  type: 'secp256k1' | 'erc1271';
  approver: Address;
  signature: BytesLike;
}

export interface ApprovalsParams {
  approvals: Approval[];
  approvers: Set<Address>;
}

export const APPROVALS_ABI = newAbiType<ApprovalsParams, ApprovalsStruct>(
  '(uint256 approversSigned, (bytes32 r, bytes32 vs)[] secp256k1, bytes[] erc1271)',
  ({ approvals, approvers }) => {
    approvals = approvals.sort((a, b) => compareAddress(a.approver, b.approver));
    const sortedApprovers = [...approvers].sort(compareAddress);

    // Approvers are encoded as a bitfield, where each bit represents whether the approver has signed
    let approversSigned = 0n;
    for (let i = 0; i < sortedApprovers.length; i++) {
      const approved = approvals.find((a) => a.approver === sortedApprovers[i]!);
      if (approved) approversSigned |= 1n << BigInt(i);
    }

    return {
      approversSigned,
      secp256k1: approvals
        .filter((a) => a.type === 'secp256k1')
        .map((a) => {
          const signature = ethers.utils.splitSignature(a.signature);
          return { r: signature.r, vs: signature._vs };
        }),
      erc1271: approvals.filter((a) => a.type === 'erc1271').map((a) => a.signature),
    };
  },
  () => {
    throw new Error('ApprovalsStruct -> ApprovalsInput is not possible');
  },
);

export const encodeAccountSignature = (policy: Policy, approvals: Approval[]) =>
  asHex(
    defaultAbiCoder.encode(
      [POLICY_ABI.type, APPROVALS_ABI.type],
      [
        POLICY_ABI.asStruct(policy),
        APPROVALS_ABI.asStruct({ approvals, approvers: policy.approvers }),
      ],
    ),
  );

export const signDigest = (digest: string, approver: Approver) =>
  asHex(ethers.utils.joinSignature(approver._signingKey().signDigest(digest)));

export const signTx = async (approver: Approver, account: Address, tx: Tx) =>
  signDigest(await hashTx(tx, { address: account, provider: approver.provider }), approver);
