import { BytesLike, ethers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { User } from './user';
import { Address, compareAddresses } from './addr';
import { getUserConfigProof } from './merkle';
import { TxReq, getDomain, TX_EIP712_TYPE } from './tx';
import { Device } from './device';
import {
  toUserConfigStruct,
  UserConfig,
  USER_CONFIG_TUPLE,
} from './userConfig';
import assert from 'assert';

export type SignatureLike = Parameters<typeof ethers.utils.splitSignature>[0];

export interface Signer {
  approver: Address;
  signature: BytesLike;
}

const toConfigAndSignatures = (user: Address, signers: Signer[]) => {
  const userSig = signers.find((s) => s.approver === user)?.signature;
  assert(userSig);

  const initial: { config: UserConfig; signatures: BytesLike[] } = {
    config: { approvers: [] },
    signatures: [userSig],
  };

  return signers
    .filter((s) => s.approver !== user)
    .sort((a, b) => compareAddresses(a.approver, b.approver))
    .reduce((acc, { approver, signature }) => {
      acc.config.approvers.push(approver);
      acc.signatures.push(signature);
      return acc;
    }, initial);
};

export const createTxSignature = (user: User, signers: Signer[]): BytesLike => {
  const { config, signatures } = toConfigAndSignatures(user.addr, signers);
  const proof = getUserConfigProof(user, config);

  return defaultAbiCoder.encode(
    [
      'address user',
      USER_CONFIG_TUPLE,
      'bytes32[] proof',
      'bytes[] signatures',
    ],
    [user.addr, toUserConfigStruct(config), proof, signatures],
  );
};

export const signTx = async (device: Device, account: Address, tx: TxReq) => {
  // _signTypedData returns a 65 byte signature
  const longSig = await device._signTypedData(
    await getDomain({ address: account, provider: device.provider }),
    TX_EIP712_TYPE,
    tx,
  );

  // Convert to a compact 64 byte (eip-2098) signature
  return ethers.utils.splitSignature(longSig).compact;
};

export const validateSignature = (
  signer: Address,
  digest: BytesLike,
  signature: SignatureLike,
) => {
  try {
    const recovered = ethers.utils.recoverAddress(digest, signature);
    return recovered === signer;
  } catch {
    return false;
  }
};
