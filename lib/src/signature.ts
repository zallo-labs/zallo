import { BytesLike, ethers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { Wallet } from './wallet';
import { Address, compareAddresses } from './addr';
import { getMultiProof } from './merkle';
import { Quorum } from './quorum';
import { TxReq, getDomain, TX_EIP712_TYPE } from './tx';
import { Device } from './device';

export type SignatureLike = Parameters<typeof ethers.utils.splitSignature>[0];

export interface Signerish {
  approver: Address;
  signature: BytesLike;
}

const split = (approversWithSigs: Signerish[]) =>
  approversWithSigs
    .sort((a, b) => compareAddresses(a.approver, b.approver))
    .reduce(
      (acc, { approver, signature }) => {
        acc.quorum.push(approver);
        acc.signatures.push(signature);
        return acc;
      },
      { quorum: [] as unknown as Quorum, signatures: [] as BytesLike[] },
    );

export const createTxSignature = (
  wallet: Wallet,
  signers: Signerish[],
): BytesLike => {
  const { quorum, signatures } = split(signers);
  const { proof, proofFlags } = getMultiProof(wallet, quorum);

  return defaultAbiCoder.encode(
    [
      'bytes4 walletRef',
      'address[] quorum',
      'bytes[] signatures',
      'bytes32[] proof',
      'uint256[] proofFlags',
    ],
    [wallet.ref, quorum, signatures, proof, proofFlags],
  );
};

export const signTx = async (device: Device, account: Address, tx: TxReq) => {
  // _signTypedData returns a 65 byte signature
  const longSig = await device._signTypedData(
    await getDomain({ address: account, provider: device.provider }),
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
