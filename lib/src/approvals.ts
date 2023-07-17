import { BytesLike, ethers } from 'ethers';
import { recoverAddress } from 'ethers/lib/utils';
import { SignatureLike } from '@ethersproject/bytes';
import { Address, asAddress, compareAddress } from './address';
import { Approver } from './approver';
import { hashTx, Tx } from './tx';
import { Hex, asHex } from './bytes';
import { ApprovalsStruct } from './contracts/TestVerifier';
import { newAbiType } from './util/abi';
import { tryOrIgnore, tryOrIgnoreAsync } from './util';

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

export const signTx = async (approver: Approver, account: Address, tx: Tx) =>
  signDigest(await hashTx(tx, { address: account, provider: approver.provider }), approver);

const ERC1271_INTERFACE = ['function isValidSignature(bytes32, bytes) view returns (bytes4)'];
const ERC1271_SUCCESS = '0x1626ba7e';

export interface VerifySignatureOptions {
  provider: ethers.providers.Provider;
  digest: BytesLike;
  approver: Address;
  signature: Hex;
}

export const verifySignature = async ({
  provider,
  digest,
  approver,
  signature,
}: VerifySignatureOptions): Promise<SignatureType | false> => {
  if (tryOrIgnore(() => asAddress(recoverAddress(digest, signature)) === approver))
    return 'secp256k1';

  // Note. even EOAs have contract code on zkSync
  const isValidErc1271 = await tryOrIgnoreAsync(async () => {
    const contract = new ethers.Contract(approver, ERC1271_INTERFACE, provider);

    return (await contract.isValidSignature(digest, signature)) === ERC1271_SUCCESS;
  });

  return isValidErc1271 ? 'erc1271' : false;
};

export interface AsApprovalOptions {
  digest: BytesLike;
  approver: Address;
  signature: Hex;
  provider: ethers.providers.Provider;
}

export const asApproval = async ({
  digest,
  approver,
  signature,
  provider,
}: AsApprovalOptions): Promise<Approval | null> => {
  const as = (type: SignatureType): Approval => ({ type, approver, signature });

  if (tryOrIgnore(() => asAddress(recoverAddress(digest, signature)) === approver))
    return as('secp256k1');

  // Note. even EOAs have contract code on zkSync
  const isValidErc1271 = await tryOrIgnoreAsync(async () => {
    const contract = new ethers.Contract(approver, ERC1271_INTERFACE, provider);

    return (await contract.isValidSignature(digest, signature)) === ERC1271_SUCCESS;
  });

  return isValidErc1271 ? as('erc1271') : null;
};
