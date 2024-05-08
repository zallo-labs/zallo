import { Address, asAddress } from './address';
import { Hex } from './bytes';
import { tryOrIgnoreAsync } from './util';
import { ERC1271_ABI } from './dapps/erc1271';
import { Network } from 'chains';
import {
  getAbiItem,
  hexToNumber,
  hexToSignature,
  recoverAddress,
  signatureToCompactSignature,
  size,
} from 'viem';
import { AbiParameterToPrimitiveType } from 'abitype';
import { TEST_VERIFIER_ABI } from './contract';

export type SignatureType = 'k256' | 'erc1271';

export interface Approval {
  type: SignatureType;
  approver: Address;
  signature: Hex;
}

export interface ApprovalsParams {
  approvals: Approval[];
  approvers: Set<Address>;
}

export const APPROVALS_ABI = getAbiItem({ abi: TEST_VERIFIER_ABI, name: 'verifyApprovals' })
  .inputs[0];
export type ApprovalsStruct = AbiParameterToPrimitiveType<typeof APPROVALS_ABI>;

export function encodeApprovalsStruct({ approvals, approvers }: ApprovalsParams): ApprovalsStruct {
  approvals = approvals.sort((a, b) => hexToNumber(a.approver) - hexToNumber(b.approver));
  const sortedApprovers = [...approvers].sort((a, b) => hexToNumber(a) - hexToNumber(b));

  return {
    k256: approvals
      .filter((a) => a.type === 'k256')
      .map((a) => signatureToCompactSignature(hexToSignature(a.signature))),
    erc1271: approvals
      .filter((a) => a.type === 'erc1271')
      .map((a) => ({
        approverIndex: sortedApprovers.findIndex((approver) => approver === a.approver),
        signature: a.signature,
      })),
  };
}

const ERC1271_SUCCESS = '0x1626ba7e';

export interface AsApprovalOptions {
  network: Network;
  hash: Hex;
  approver: Address;
  signature: Hex;
}

export const asApproval = async ({
  network,
  hash,
  approver,
  signature,
}: AsApprovalOptions): Promise<Approval | null> => {
  const as = (type: SignatureType): Approval => ({ type, approver, signature });

  const sigSize = size(signature);
  if (
    (sigSize === 64 || sigSize === 65) &&
    (await tryOrIgnoreAsync(
      async () => asAddress(await recoverAddress({ hash: hash, signature })) === approver,
    ))
  )
    return as('k256');

  // Note. even EOAs have contract code on zkSync
  const isValidErc1271 = await tryOrIgnoreAsync(async () => {
    const r = await network.readContract({
      address: approver,
      abi: ERC1271_ABI,
      functionName: 'isValidSignature',
      args: [hash, signature],
    });

    return r === ERC1271_SUCCESS;
  });

  return isValidErc1271 ? as('erc1271') : null;
};
