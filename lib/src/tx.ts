import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { ethers } from 'ethers';
import { Address, Addresslike, asAddress } from './address';
import { asHex, EMPTY_HEX_BYTES } from './bytes';
import { Operation, encodeOperationsData } from './operation';
import _ from 'lodash';

export interface Tx {
  operations: [Operation, ...Operation[]];
  nonce: bigint;
  gasLimit?: bigint;
}

export type TxOptions = Omit<Tx, 'operations'> &
  ((Operation & { operations?: never }) | { operations: [Operation, ...Operation[]] });

export const asTx = (o: TxOptions): Tx => ({
  ..._.omit(o, 'operations'),
  operations: 'operations' in o ? o.operations! : [_.pick(o, ['to', 'value', 'data'])],
});

export interface TransactionData extends Omit<Tx, 'operations'>, Operation {}

export const asTransactionData = (account: Address, tx: Tx): TransactionData => ({
  ...(tx.operations.length === 1
    ? tx.operations[0]
    : {
        to: account,
        data: encodeOperationsData(tx.operations),
      }),
  nonce: tx.nonce,
  gasLimit: tx.gasLimit,
});

export type TypedDataTypes = Record<string, TypedDataField[]>;

export const TX_EIP712_TYPE: TypedDataTypes = {
  /* Fields that probably SHOULD be included but are not yet: */
  // maxFeePerGas
  // maxPriorityFeePerGas
  // paymaster: problematic as this would require re-signing for ETH <-> non-ETH feeToken switching

  /* Fields NOT included: */
  // gasLimit: not dangerous and can't be predicted due to approvals requiring gas; a maxGasFee could be implemented instead
  // gasPerPubdataByteLimit: not dangerous
  // paymasterInput: minimalAllowance can't be predicted and changing fee token would require re-signing
  // factoryDeps: not dangerous
  // reserved:        maybe it should be? Currently unused by zkSync
  // reservedDynamic: ^
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

export const hashTx = async (tx: Tx, domainParams: GetDomainParams) => {
  const txData = asTransactionData(asAddress(domainParams.address), tx);

  return asHex(
    ethers.utils._TypedDataEncoder.hash(await getDomain(domainParams), TX_EIP712_TYPE, {
      to: txData.to,
      value: txData.value ?? 0n,
      data: txData.data ?? EMPTY_HEX_BYTES,
      nonce: txData.nonce,
    } satisfies TransactionData),
  );
};
