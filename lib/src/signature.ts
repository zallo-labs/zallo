import { BytesLike, ethers, Wallet } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { Address } from './addr';
import {
  Approverish,
  hashApprover,
  SafeApprover,
  toSafeApprover,
} from './approver';
import { Groupish } from './group';
import { getMultiProof } from './merkle';
import { TxReq, getDomain, TX_EIP712_TYPE } from './tx';

export type SignatureLike = Parameters<typeof ethers.utils.splitSignature>[0];

export type Signerish = Approverish & {
  signature: BytesLike;
};

const split = (approversWithSigs: Signerish[]) =>
  approversWithSigs
    .map((s) => ({ signature: s.signature, ...toSafeApprover(s) }))
    .sort((a, b) => Buffer.compare(hashApprover(a), hashApprover(b)))
    .reduce(
      (acc, { signature, ...approver }) => {
        acc.approvers.push(approver);
        acc.signatures.push(signature);
        return acc;
      },
      { approvers: [] as SafeApprover[], signatures: [] as BytesLike[] },
    );

export const createTxSignature = (
  group: Groupish,
  signers: Signerish[],
): BytesLike => {
  const { approvers, signatures } = split(signers);
  const { proof, proofFlags } = getMultiProof(group, approvers);

  return defaultAbiCoder.encode(
    [
      'bytes32 groupRef',
      '(address addr, uint96 weight)[] approvers',
      'bytes[] signatures',
      'bytes32[] proof',
      'uint256[] proofFlags',
    ],
    [group.ref, approvers, signatures, proof, proofFlags],
  );
};

export const signTx = async (wallet: Wallet, safe: Address, tx: TxReq) => {
  // _signTypedData returns a 65 byte signature
  const longSig = await wallet._signTypedData(
    await getDomain(safe),
    TX_EIP712_TYPE,
    tx,
  );

  // Convert to a compact 64 byte signature (eip-2098)
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
