import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { BigNumber, ethers } from 'ethers';
import { hexDataLength, hexlify, randomBytes } from 'ethers/lib/utils';
import { Addresslike } from './addr';
import { zeroHexBytes } from './bytes';
import { Call } from './call';

export type TxSalt = string & { isTxSalt: true };
const TX_SALT_BYTES = 8;

export const randomTxSalt = (): TxSalt => hexlify(randomBytes(TX_SALT_BYTES)) as TxSalt;

export const toTxSalt = (v: string): TxSalt => {
  if (hexDataLength(v) !== TX_SALT_BYTES) throw new Error('Invalid tx salt: ' + v);

  return v as TxSalt;
};

export const ZERO_TX_SALT = zeroHexBytes(TX_SALT_BYTES) as TxSalt;

export interface Tx extends Call {
  salt: TxSalt;
  gasLimit?: BigNumber;
}

export type TxOptions = Omit<Tx, 'salt'> & Partial<Pick<Tx, 'salt'>>;

export const toTx = (opts: TxOptions): Tx => ({
  ...opts,
  salt: opts.salt ?? randomTxSalt(),
});

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

export const hashTx = async (tx: Tx, domainParams: GetDomainParams) =>
  ethers.utils._TypedDataEncoder.hash(await getDomain(domainParams), TX_EIP712_TYPE, tx);
