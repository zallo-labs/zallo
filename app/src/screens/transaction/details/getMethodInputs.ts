import {
  BytesLike,
  FunctionFragment,
  Interface,
  ParamType,
} from 'ethers/lib/utils';

export interface MethodInput {
  param: ParamType;
  data: unknown;
}

export interface GetMethodInputsOptions {
  contractInterface: Interface;
  fragment: FunctionFragment;
  data: BytesLike;
}

export const getMethodInputs = ({
  contractInterface,
  fragment,
  data,
}: GetMethodInputsOptions): MethodInput[] => {
  const decodedData = contractInterface.decodeFunctionData(fragment, data);
  fragment.inputs;

  return fragment.inputs.map((param, i) => ({
    param,
    data: decodedData[i],
  }));
};
