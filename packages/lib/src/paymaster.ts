import { encodeAbiParameters, encodeFunctionData, isHex } from 'viem';
import { abi as flowAbi } from './abi/PaymasterFlows';
import { parseAbiParameters } from 'abitype';
import { Hex } from './bytes';
import { Address } from './address';

export interface PayForTransactionParams {
  token: Address;
  amount: bigint;
  maxAmount: bigint;
}

export function encodePaymasterInput(params: PayForTransactionParams): Hex {
  return encodeFunctionData({
    abi: flowAbi,
    functionName: 'approvalBasedWithMax',
    args: [params.token, params.amount, params.maxAmount],
  });
}

export interface PaymasterSignedInputParams {
  token: Address;
  maxAmount: bigint;
}

export function paymasterSignedInput(params: PaymasterSignedInputParams | Hex): Hex {
  if (isHex(params)) return params;

  return encodeAbiParameters(parseAbiParameters('address token, uint256 maxAmount'), [
    params.token,
    params.maxAmount,
  ]);
}
