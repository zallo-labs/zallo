import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { BigNumber, BigNumberish, ethers } from 'ethers';
import { hexDataLength, hexlify, isBytesLike, randomBytes } from 'ethers/lib/utils';
import { address, Addresslike, isAddress } from './addr';
import { zeroHexBytes } from './bytes';
import { Call, CallDef, createCall } from './call';
import { Id, toId } from './id';
import { createIsObj } from './util/mappedTypes';

export interface TxReq extends Call {
  salt: TxSalt;
  gasLimit?: BigNumberish;
}

export const isCall = createIsObj<Call>(
  ['to', isAddress],
  ['value', BigNumber.isBigNumber],
  ['data', isBytesLike],
);

const isTxReqExtras = createIsObj<TxReq>(
  ['salt', isBytesLike],
  ['gasLimit', (v) => v === undefined || BigNumber.isBigNumber(v)],
);
export const isTxReq = (e: unknown): e is TxReq => isCall(e) && isTxReqExtras(e);

export type TypedDataTypes = Record<string, TypedDataField[]>;

export const TX_EIP712_TYPE: TypedDataTypes = {
  Tx: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'salt', type: 'bytes8' },
  ],
};

export interface GetDomainParams {
  address: Addresslike;
  provider: ethers.providers.Provider;
}

export const getDomain = async ({
  address,
  provider,
}: GetDomainParams): Promise<TypedDataDomain> => ({
  chainId: (await provider.getNetwork()).chainId,
  verifyingContract: address,
});

export interface HashTxParams extends GetDomainParams {
  tx: TxReq;
}

export const hashTx = async ({ tx, ...domainParams }: HashTxParams) =>
  ethers.utils._TypedDataEncoder.hash(await getDomain(domainParams), TX_EIP712_TYPE, tx);

export type TxSalt = string & { isTxSalt: true };
const TX_SALT_BYTES = 8;

export const randomTxSalt = (): TxSalt => hexlify(randomBytes(TX_SALT_BYTES)) as TxSalt;

export const toTxSalt = (v: string): TxSalt => {
  if (hexDataLength(v) !== TX_SALT_BYTES) throw new Error('Invalid tx salt: ' + v);

  return v as TxSalt;
};

export const ZERO_TX_SALT = zeroHexBytes(TX_SALT_BYTES) as TxSalt;

export interface TxDef extends CallDef {
  salt?: TxSalt;
  gasLimit?: BigNumberish;
}

export const createTx = (tx: TxDef): TxReq => ({
  ...createCall(tx),
  salt: tx.salt || randomTxSalt(),
  gasLimit: tx.gasLimit,
});

export const getTxId = (txHash: string): Id => toId(txHash);

export const getTxIdParts = (id: Id) => {
  const [account, hash] = id.split('-');

  return {
    account: address(account),
    hash,
  };
};
