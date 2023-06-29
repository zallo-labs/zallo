import { ContractFunctionParams, useContractFunction } from '@api/contracts';
import _ from 'lodash';

const toSentenceCase = (str?: string) => {
  if (!str) return undefined;
  const s = str.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();

  return s.slice(0, 1)?.toUpperCase() + s.slice(1);
};

export const useFunctionLabel = <P extends ContractFunctionParams | undefined>(params: P) => {
  const f = useContractFunction(params);

  return toSentenceCase(f?.abi.name) || params?.selector;
};

export type FunctionLabelProps = ContractFunctionParams;

export const FunctionLabel = (props: FunctionLabelProps) => <>{useFunctionLabel(props)}</>;
