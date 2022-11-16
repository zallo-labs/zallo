import { BigNumber } from 'ethers';
import { BytesLike, ParamType } from 'ethers/lib/utils';
import { ContractMethod } from '~/queries/useContractMethod.api';

const tryTransformData = (data: unknown) => {
  if (BigNumber.isBigNumber(data)) return data.toString();
  return data;
};

export interface MethodInput {
  param: ParamType;
  data: unknown;
}

export const getMethodInputs = (method: ContractMethod, data: BytesLike): MethodInput[] => {
  const decodedData = method.contract.decodeFunctionData(method.fragment, data);

  return method.fragment.inputs.map((param, i) => ({
    param,
    data: tryTransformData(decodedData[i]),
  }));
};
