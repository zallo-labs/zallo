import { BytesLike, ethers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { Address, compareAddress } from './addr';
import { TxReq, hashTx } from './tx';
import { Device } from './device';
import { Quorum, QUORUM_ID_ABI } from './quorum';

export type SignatureLike = Parameters<typeof ethers.utils.splitSignature>[0];

// Convert to a compact 64 byte (eip-2098) signature
export const toCompactSignature = (signature: SignatureLike) =>
  ethers.utils.splitSignature(signature).compact;

export interface Signer {
  approver: Address;
  signature: BytesLike;
}

export const createTxSignature = (quorum: Quorum, signers: Signer[]): BytesLike => {
  const signatures = signers
    .sort((a, b) => compareAddress(a.approver, b.approver))
    .map((s) => toCompactSignature(s.signature));

  return defaultAbiCoder.encode(
    [`${QUORUM_ID_ABI} id`, 'bytes[] signatures'],
    [quorum.id, signatures],
  );
};

export const signProposal = (id: string, device: Device) =>
  ethers.utils.joinSignature(device._signingKey().signDigest(id));

export const signTx = async (device: Device, account: Address, tx: TxReq) =>
  signProposal(await hashTx(tx, { address: account, provider: device.provider }), device);

export const validateSignature = (signer: Address, digest: BytesLike, signature: SignatureLike) => {
  try {
    const recovered = ethers.utils.recoverAddress(digest, signature);
    return recovered === signer;
  } catch {
    return false;
  }
};
