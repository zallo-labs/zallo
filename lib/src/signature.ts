import { BytesLike, ethers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { SignatureLike } from '@ethersproject/bytes';
import { Address, compareAddress } from './address';
import { Approver } from './approver';
import { Policy } from './policy';
import { hashTx, Tx } from './tx';
import { asHex, Hex } from './bytes';

// Convert to a compact 64 byte (eip-2098) signature
export const toCompactSignature = (signature: SignatureLike) =>
  ethers.utils.splitSignature(signature).compact;

export interface Approval {
  approver: Address;
  signature: BytesLike;
}

export const encodeAccountSignature = (policy: Policy, approvals: Approval[]): Hex => {
  const signatures = approvals
    .sort((a, b) => compareAddress(a.approver, b.approver))
    .map((s) => toCompactSignature(s.signature));

  return asHex(
    defaultAbiCoder.encode([Policy.ABI, 'bytes[] signatures'], [policy.struct, signatures]),
  );
};

export const signDigest = (digest: string, approver: Approver) =>
  asHex(ethers.utils.joinSignature(approver._signingKey().signDigest(digest)));

export const signTx = async (approver: Approver, account: Address, tx: Tx) =>
  signDigest(await hashTx(tx, { address: account, provider: approver.provider }), approver);
