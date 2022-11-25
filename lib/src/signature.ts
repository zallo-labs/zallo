import { BytesLike, ethers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { User } from './user';
import { Address, compareAddress } from './addr';
import { getUserConfigProof } from './merkle';
import { TxReq, getDomain, TX_EIP712_TYPE, hashTx } from './tx';
import { Device } from './device';
import { toUserConfigStruct, USER_CONFIG_TUPLE } from './userConfig';
import assert from 'assert';
import _ from 'lodash';

export type SignatureLike = Parameters<typeof ethers.utils.splitSignature>[0];

export interface Signer {
  approver: Address;
  signature: BytesLike;
}

const toUserConfigAndSignatures = (user: Address, signers: Signer[]) => {
  const userSig = signers.find((s) => s.approver === user)?.signature;
  assert(userSig);

  const initial: { approvers: Address[]; signatures: BytesLike[] } = {
    approvers: [],
    signatures: [userSig],
  };

  return signers
    .filter((s) => s.approver !== user)
    .sort((a, b) => compareAddress(a.approver, b.approver))
    .reduce((acc, { approver, signature }) => {
      acc.approvers.push(approver);
      acc.signatures.push(toCompactSignature(signature)); // Compact signature
      return acc;
    }, initial);
};

export const createUserSignature = (user: User, signers: Signer[]): BytesLike => {
  const { approvers, signatures } = toUserConfigAndSignatures(user.addr, signers);

  const sortedApprovers = approvers.sort(compareAddress);
  const config = user.configs.find((c) =>
    _.isEqual(c.approvers.sort(compareAddress), sortedApprovers),
  );
  assert(config);

  const proof: Buffer[] = getUserConfigProof(user, config);

  return defaultAbiCoder.encode(
    ['address user', USER_CONFIG_TUPLE, 'bytes32[] proof', 'bytes[] signatures'],
    [user.addr, toUserConfigStruct(config), proof, signatures],
  );
};

export const signTx = async (device: Device, account: Address, tx: TxReq) =>
  ethers.utils.joinSignature(
    device
      ._signingKey()
      .signDigest(await hashTx({ address: account, provider: device.provider, tx })),
  );

// Convert to a compact 64 byte (eip-2098) signature
export const toCompactSignature = (signature: SignatureLike) =>
  ethers.utils.splitSignature(signature).compact;

export const validateSignature = (signer: Address, digest: BytesLike, signature: SignatureLike) => {
  try {
    const recovered = ethers.utils.recoverAddress(digest, signature);
    return recovered === signer;
  } catch {
    return false;
  }
};
