import { BytesLike, ethers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { Address, compareAddress } from './addr';
import { Approver } from './approver';
import { Rule } from './rule';
import { hashTx, Tx } from './tx';

export type SignatureLike = Parameters<typeof ethers.utils.splitSignature>[0];

// Convert to a compact 64 byte (eip-2098) signature
export const toCompactSignature = (signature: SignatureLike) =>
  ethers.utils.splitSignature(signature).compact;

export interface Approval {
  signer: Address;
  signature: BytesLike;
}

export const encodeAccountSignature = (rule: Rule, approvals: Approval[]): BytesLike => {
  const signatures = approvals
    .sort((a, b) => compareAddress(a.signer, b.signer))
    .map((s) => toCompactSignature(s.signature));

  return defaultAbiCoder.encode([Rule.ABI, 'bytes[] signatures'], [rule.struct, signatures]);
};

export const signDigest = (digest: string, approver: Approver) =>
  ethers.utils.joinSignature(approver._signingKey().signDigest(digest));

export const signTx = async (approver: Approver, account: Address, tx: Tx) =>
  signDigest(await hashTx(tx, { address: account, provider: approver.provider }), approver);
