import { ContractFunctionFieldsFragment } from '@api/gen/graphql';
import { Selector } from 'lib';
import { AbiFunction } from 'abitype';

export interface ContractFunction {
  selector: Selector;
  abi: AbiFunction;
}

export const fragmentToContractFunction = (
  f: ContractFunctionFieldsFragment,
): ContractFunction => ({ selector: f.selector, abi: f.abi as any });
