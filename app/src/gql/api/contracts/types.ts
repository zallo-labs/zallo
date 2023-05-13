import { ContractFunctionFieldsFragment } from '@api/generated';
import * as ethers from 'ethers';
import { FunctionFragment, Interface } from 'ethers/lib/utils';
import { Selector } from 'lib';

export interface ContractFunction {
  selector: Selector;
  fragment: FunctionFragment;
  iface: Interface;
}

export const fragmentToContractFunction = (f: ContractFunctionFieldsFragment): ContractFunction => {
  const fragment = FunctionFragment.from(f.abi);

  return {
    selector: f.selector,
    fragment,
    iface: ethers.Contract.getInterface([fragment]),
  };
};
