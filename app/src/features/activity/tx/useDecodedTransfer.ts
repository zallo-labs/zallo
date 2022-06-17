import { BigNumber, BytesLike } from 'ethers';
import { FunctionFragment, Interface } from 'ethers/lib/utils';
import { address, Address } from 'lib';
import { getSighash, useContractMethod } from '~/queries/useContractMethod';

export const TRANSFER_METHOD_SIGHASH = '0xa9059cbb';

export const isTransferMethod = (data: BytesLike) =>
  getSighash(data) === TRANSFER_METHOD_SIGHASH;

export interface DecodedTransfer {
  to: Address;
  value: BigNumber;
}

export const tryDecodeTransfer = (
  data: BytesLike,
  methodFragment?: FunctionFragment,
  methodInterface?: Interface,
): DecodedTransfer | undefined => {
  if (!isTransferMethod(data) || !methodFragment || !methodInterface)
    return undefined;

  const [dest, value] = methodInterface.decodeFunctionData(
    methodFragment,
    data,
  );

  return { to: address(dest), value };
};

export const useDecodedTransfer = (
  to: Address,
  data: BytesLike,
): DecodedTransfer | undefined => {
  const { methodFragment, methodInterface } = useContractMethod(to, data);

  return tryDecodeTransfer(data, methodFragment, methodInterface);
};
