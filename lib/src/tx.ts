import {
  TypedDataDomain,
  TypedDataField,
} from '@ethersproject/abstract-signer';
import { BigNumber, BigNumberish, BytesLike, ethers } from 'ethers';
import { hexlify, randomBytes } from 'ethers/lib/utils';
import { Wallet } from 'zksync-web3';
import { address, Address, ZERO_ADDR } from './addr';
import { ZERO } from './bignum';
import { Bytes8 } from './bytes';
import { toCompactSignature } from './signature';
import { createIsObj } from './util/mappedTypes';

export interface Tx {
  to: Address;
  value: BigNumber;
  data: BytesLike;
  salt: Bytes8;
}

export const isTx = createIsObj<Tx>('to', 'value', 'data', 'salt');

const TX_EIP712_TYPE: Record<string, TypedDataField[]> = {
  Tx: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'salt', type: 'bytes8' },
  ],
};

export const getDomain = async (
  verifyingContract: Address,
): Promise<TypedDataDomain> => ({
  // chainId: (await contract.provider.getNetwork()).chainId,
  chainId: 0, // ZKSYNC: block.chainid always returns 0 - https://v2-docs.zksync.io/dev/zksync-v2/temp-limits.html#unsupported-opcodes
  verifyingContract,
});

export const hashTx = async (contract: Address, tx: Tx) =>
  ethers.utils._TypedDataEncoder.hash(
    await getDomain(contract),
    TX_EIP712_TYPE,
    tx,
  );

export const signTx = async (wallet: Wallet, safe: Address, tx: Tx) => {
  // _signTypedData returns a 65 byte signature
  const longSig = await wallet._signTypedData(
    await getDomain(safe),
    TX_EIP712_TYPE,
    tx,
  );

  // Convert to a compact 64 byte signature (eip-2098)
  return toCompactSignature(longSig);
};

export const randomSalt = (): Bytes8 => hexlify(randomBytes(8));

export interface TxDef {
  to?: Address | string;
  value?: BigNumberish;
  data?: BytesLike;
  salt?: Bytes8;
}

export const createTx = (tx: TxDef): Tx => ({
  to: (tx.to && address(tx.to)) || ZERO_ADDR,
  value: tx.value !== undefined ? BigNumber.from(tx.value) : ZERO,
  data: tx.data ? hexlify(tx.data) : [],
  salt: tx.salt || randomSalt(),
});
