import { gql } from '@apollo/client';
import {
  ContractMethodDocument,
  ContractMethodQuery,
  ContractMethodQueryVariables,
} from '@api/generated';
import { Contract } from 'ethers';
import { FunctionFragment, Interface } from 'ethers/lib/utils';
import { Call, getSelector } from 'lib';
import { useMemo } from 'react';
import { useSuspenseQuery } from '~/gql/util';
import assert from 'assert';

export interface ContractMethod {
  selector: string;
  fragment: FunctionFragment;
  contract: Interface;
}

gql`
  query ContractMethod($contract: Address!, $sighash: Bytes!) {
    contractMethod(contract: $contract, sighash: $sighash) {
      id
      fragment
    }
  }
`;

export const useContractMethod = <C extends Call | undefined>(call: C) => {
  const selector = getSelector(call?.data);

  const skip = !call || !selector;
  const { data } = useSuspenseQuery<ContractMethodQuery, ContractMethodQueryVariables>(
    ContractMethodDocument,
    {
      variables: { contract: call?.to, sighash: selector },
      skip,
    },
  );

  const method = useMemo((): ContractMethod | undefined => {
    if (!selector || !data.contractMethod) return undefined;

    const fragment = FunctionFragment.from(data.contractMethod.fragment);

    return {
      selector,
      fragment,
      contract: Contract.getInterface([fragment]),
    };
  }, [data.contractMethod, selector]);

  if (!skip) assert(method);
  return method as Call extends undefined ? ContractMethod | undefined : ContractMethod;
};
