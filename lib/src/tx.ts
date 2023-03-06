import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { BigNumber, ethers } from 'ethers';
import { Addresslike } from './addr';
import { ZERO } from './bignum';
import { EMPTY_BYTES } from './bytes';
import { Call } from './call';

export interface Tx extends Call {
  nonce: BigNumber;
  gasLimit?: BigNumber;
}

export type TxOptions = Tx;

export const toTx = (opts: TxOptions): Tx => opts;

export type TypedDataTypes = Record<string, TypedDataField[]>;

export const TX_EIP712_TYPE: TypedDataTypes = {
  Tx: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'nonce', type: 'uint256' },
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
  ethers.utils._TypedDataEncoder.hash(await getDomain(domainParams), TX_EIP712_TYPE, {
    to: tx.to,
    value: tx.value ?? ZERO,
    data: tx.data ?? EMPTY_BYTES,
    nonce: tx.nonce,
  } satisfies Tx);
