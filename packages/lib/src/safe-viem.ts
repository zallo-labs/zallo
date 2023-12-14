import {
  Abi,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  DecodeErrorResultReturnType,
} from 'viem';

export interface DecodeRevertErrorParams<TAbi extends Abi> {
  error: unknown;
  abi: TAbi;
}

export function decodeRevertError<TAbi extends Abi>({
  error: e,
}: DecodeRevertErrorParams<TAbi>): DecodeErrorResultReturnType<TAbi> | undefined {
  if (
    e instanceof ContractFunctionExecutionError &&
    e.cause instanceof ContractFunctionRevertedError &&
    e.cause.data
  ) {
    return e.cause.data as DecodeErrorResultReturnType<TAbi>;
  }
}
