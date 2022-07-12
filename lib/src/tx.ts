import {
  TypedDataDomain,
  TypedDataField,
} from '@ethersproject/abstract-signer';
import { BigNumber, Contract, ethers } from 'ethers';
import { hexlify, isBytesLike, randomBytes } from 'ethers/lib/utils';
import { Wallet } from 'zksync-web3';
import { Address, isAddress } from './addr';
import { Bytes8 } from './bytes';
import { Call, CallDef, createCall } from './call';
import { createIsObj } from './util/mappedTypes';

export interface TxReq extends Call {
  salt: Bytes8;
}

export const isCall = createIsObj<Call>(
  ['to', isAddress],
  ['value', BigNumber.isBigNumber],
  ['data', isBytesLike],
);

const isTxReqExtras = createIsObj<TxReq>(['salt', isBytesLike]);
export const isTxReq = (e: unknown): e is TxReq =>
  isCall(e) && isTxReqExtras(e);

const TX_EIP712_TYPE: Record<string, TypedDataField[]> = {
  Tx: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'salt', type: 'bytes8' },
  ],
};

export const getDomain = async (
  verifyingContract: Address | Contract,
): Promise<TypedDataDomain> => ({
  // chainId: (await contract.provider.getNetwork()).chainId,
  chainId: 0, // ZKSYNC: block.chainid always returns 0 - https://v2-docs.zksync.io/dev/zksync-v2/temp-limits.html#unsupported-opcodes
  verifyingContract:
    typeof verifyingContract === 'string'
      ? verifyingContract
      : verifyingContract.address,
});

export const hashTx = async (contract: Address | Contract, tx: TxReq) =>
  ethers.utils._TypedDataEncoder.hash(
    await getDomain(contract),
    TX_EIP712_TYPE,
    tx,
  );

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

export const randomTxSalt = (): Bytes8 => hexlify(randomBytes(8));

export interface TxDef extends CallDef {
  salt?: Bytes8;
}

export const createTx = (tx: TxDef): TxReq => ({
  ...createCall(tx),
  salt: tx.salt || randomTxSalt(),
});
