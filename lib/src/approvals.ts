import { BytesLike, ethers } from 'ethers';
import { recoverAddress } from 'ethers/lib/utils';
import { SignatureLike } from '@ethersproject/bytes';
import { Address, UAddress, asAddress, compareAddress } from './address';
import { Approver } from './approver';
import { hashTx, Tx } from './tx';
import { Hex, asHex } from './bytes';
import { ApprovalsStruct } from './contracts/TestVerifier';
import { newAbiType } from './util/abi';
import { tryOrIgnore, tryOrIgnoreAsync } from './util';
import { ERC1271_ABI } from './abi/erc1271';
import { Network } from './chains';
import { size } from 'viem';

// Convert to a compact 64 byte (eip-2098) signature
export const toCompactSignature = (signature: SignatureLike) =>
  ethers.utils.splitSignature(signature).compact;

export type SignatureType = 'secp256k1' | 'erc1271';

export interface Approval {
  type: SignatureType;
  approver: Address;
  signature: Hex;
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

export const signDigest = (digest: BytesLike, approver: Approver) =>
  asHex(ethers.utils.joinSignature(approver._signingKey().signDigest(digest)));

export const signTx = (approver: Approver, account: UAddress, tx: Tx) =>
  signDigest(hashTx(account, tx), approver);

const ERC1271_SUCCESS = '0x1626ba7e';

export interface AsApprovalOptions {
  network: Network;
  digest: Hex;
  approver: Address;
  signature: Hex;
}

export const asApproval = async ({
  network,
  digest,
  approver,
  signature,
}: AsApprovalOptions): Promise<Approval | null> => {
  const as = (type: SignatureType): Approval => ({ type, approver, signature });

  const sigSize = size(signature);
  if (
    (sigSize === 64 || sigSize === 65) &&
    tryOrIgnore(() => asAddress(recoverAddress(digest, signature)) === approver)
  )
    return as('secp256k1');

  // Note. even EOAs have contract code on zkSync
  const isValidErc1271 = await tryOrIgnoreAsync(async () => {
    const r = await network.readContract({
      address: approver,
      abi: ERC1271_ABI,
      functionName: 'isValidSignature',
      args: [digest, signature],
    });

    return r === ERC1271_SUCCESS;
  });

  return isValidErc1271 ? as('erc1271') : null;
};
