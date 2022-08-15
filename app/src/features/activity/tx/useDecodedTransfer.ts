import { BigNumber, BytesLike } from 'ethers';
import { FunctionFragment, Interface } from 'ethers/lib/utils';
import { address, Address } from 'lib';
import {
  getDataSighash,
  useContractMethod,
} from '~/queries/useContractMethod.api';
import { ERC20_INTERFACE } from '~/token/token';

const ERC20_TRANSFER_SIGHASH = ERC20_INTERFACE.getSighash(
  ERC20_INTERFACE.functions['transfer(address,uint256)'],
);

export const isTransferMethod = (data: BytesLike) =>
  getDataSighash(data) === ERC20_TRANSFER_SIGHASH;

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
  const { methodFragment, contractInterface: methodInterface } =
    useContractMethod(to, data);

  return tryDecodeTransfer(data, methodFragment, methodInterface);
};
