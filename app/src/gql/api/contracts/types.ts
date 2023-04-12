import { ContractFunctionFieldsFragment } from '@api/generated';
import * as ethers from 'ethers';
import { FunctionFragment, Interface } from 'ethers/lib/utils';
import { Address, Selector, asSelector, tryAsAddress } from 'lib';

export interface ContractFunction {
  contract?: Address;
  selector: Selector;
  fragment: FunctionFragment;
  iface: Interface;
}

export const fragmentToContractFunction = (f: ContractFunctionFieldsFragment): ContractFunction => {
  const fragment = FunctionFragment.from(f.abi);

  return {
    contract: tryAsAddress(f.contractId || undefined),
    selector: asSelector(f.selector),
    fragment,
    iface: ethers.Contract.getInterface([fragment]),
  };
};
