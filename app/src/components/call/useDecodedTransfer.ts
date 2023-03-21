import { useContractMethod } from '@api/method';
import { ERC20_INTERFACE } from '@token/token';
import { asAddress, Address, Call } from 'lib';

const ERC20_TRANSFER_SELECTOR = ERC20_INTERFACE.getSighash(
  ERC20_INTERFACE.functions['transfer(address,uint256)'],
);

export interface DecodedTransfer {
  to: Address;
  value: bigint;
}

export const useDecodedTransfer = (call?: Call): DecodedTransfer | undefined => {
  const method = useContractMethod(call);

  if (!call?.data || method?.selector !== ERC20_TRANSFER_SELECTOR) return undefined;

  const [dest, value] = method.contract.decodeFunctionData(method.fragment, call.data);

  return { to: asAddress(dest), value: BigInt(value) };
};
