import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { ethers } from 'ethers';
import { Addresslike } from './address';
import { asHex, EMPTY_HEX_BYTES } from './bytes';
import { Call } from './call';

export interface Tx extends Call {
  nonce: bigint;
  gasLimit?: bigint;
}

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
  asHex(
    ethers.utils._TypedDataEncoder.hash(await getDomain(domainParams), TX_EIP712_TYPE, {
      to: tx.to,
      value: tx.value ?? 0n,
      data: tx.data ?? EMPTY_HEX_BYTES,
      nonce: tx.nonce,
    } satisfies Tx),
  );
