import { gql } from '@apollo/client';
import {
  ContractFunctionDocument,
  ContractFunctionQuery,
  ContractFunctionQueryVariables,
} from '@api/generated';
import { Address, Call, Selector, asSelector } from 'lib';
import { useMemo } from 'react';
import { useSuspenseQuery } from '~/gql/util';
import assert from 'assert';
import { ContractFunction, fragmentToContractFunction } from './types';

gql`
  fragment ContractFunctionFields on ContractFunction {
    id
    contractId
    selector
    abi
    source
    sourceConfidence
  }

  query ContractFunction($args: ContractFunctionInput!) {
    contractFunction(args: $args) {
      ...ContractFunctionFields
    }
  }
`;

export interface ContractFunctionParams {
  contract?: Address;
  selector: Selector;
}

export const useContractFunction = <P extends ContractFunctionParams | Call | undefined>(
  params: P,
) => {
  const contract = params && 'to' in params ? params.to : params?.contract;
  const selector = params && ('selector' in params ? params.selector : asSelector(params.data));

  const skip = !contract || !selector;
  const { data } = useSuspenseQuery<ContractFunctionQuery, ContractFunctionQueryVariables>(
    ContractFunctionDocument,
    {
      variables: { args: { contract, selector } },
      skip,
    },
  );

  const func = useMemo(
    () => (data.contractFunction ? fragmentToContractFunction(data.contractFunction) : undefined),
    [data.contractFunction],
  );

  if (!skip) assert(func);
  return func as P extends undefined ? ContractFunction | undefined : ContractFunction;
};
