import { ERC20_INTERFACE } from '@token/token';
import { BigNumber } from 'ethers';
import { address, Address, Call } from 'lib';
import { useContractMethod } from '~/queries/useContractMethod.api';

export const ERC20_TRANSFER_SIGHASH = ERC20_INTERFACE.getSighash(
  ERC20_INTERFACE.functions['transfer(address,uint256)'],
);

export interface DecodedTransfer {
  to: Address;
  value: BigNumber;
}

export const useDecodedTransfer = (
  call?: Call,
): DecodedTransfer | undefined => {
  const method = useContractMethod(call);

  if (!call || method?.sighash !== ERC20_TRANSFER_SIGHASH) return undefined;

  const [dest, value] = method.contract.decodeFunctionData(
    method.fragment,
    call.data,
  );

  return { to: address(dest), value };
};
