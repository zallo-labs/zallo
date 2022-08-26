import { BytesLike, ParamType } from 'ethers/lib/utils';
import { ContractMethod } from '~/queries/useContractMethod.api';

export interface MethodInput {
  param: ParamType;
  data: unknown;
}

export const getMethodInputs = (
  method: ContractMethod,
  data: BytesLike,
): MethodInput[] => {
  const decodedData = method.contract.decodeFunctionData(method.fragment, data);

  return method.fragment.inputs.map((param, i) => ({
    param,
    data: decodedData[i],
  }));
};
