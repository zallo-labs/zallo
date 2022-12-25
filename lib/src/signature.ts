import { BytesLike, ethers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { Address, compareAddress } from './addr';
import { hashTx, Tx } from './tx';
import { UserWallet } from './user';
import { Quorum, QUORUM_ABI, QUORUM_KEY_ABI, toQuorumStruct } from './quorum';

export type SignatureLike = Parameters<typeof ethers.utils.splitSignature>[0];

// Convert to a compact 64 byte (eip-2098) signature
export const toCompactSignature = (signature: SignatureLike) =>
  ethers.utils.splitSignature(signature).compact;

export interface Signer {
  approver: Address;
  signature: BytesLike;
}

export const toAccountSignature = (quorum: Quorum, signers: Signer[]): BytesLike => {
  const signatures = signers
    .sort((a, b) => compareAddress(a.approver, b.approver))
    .map((s) => toCompactSignature(s.signature));

  return defaultAbiCoder.encode(
    [QUORUM_KEY_ABI, QUORUM_ABI, 'bytes[] signatures'],
    [quorum.key, toQuorumStruct(quorum), signatures],
  );
};

export const signProposal = (id: string, device: UserWallet) =>
  ethers.utils.joinSignature(device._signingKey().signDigest(id));

export const signTx = async (wallet: UserWallet, account: Address, tx: Tx) =>
  signProposal(await hashTx(tx, { address: account, provider: wallet.provider }), wallet);

export const validateSignature = (signer: Address, digest: BytesLike, signature: SignatureLike) => {
  try {
    const recovered = ethers.utils.recoverAddress(digest, signature);
    return recovered === signer;
  } catch {
    return false;
  }
};
