import { gql } from '@apollo/client';
import {
  ContractFunctionDocument,
  ContractFunctionQuery,
  ContractFunctionQueryVariables,
} from '@api/generated';
import { Address, Operation, Selector, asSelector } from 'lib';
import { useMemo } from 'react';
import { useSuspenseQuery } from '~/gql/util';
import assert from 'assert';
import { ContractFunction, fragmentToContractFunction } from './types';

gql`
  fragment ContractFunctionFields on ContractFunction {
    id
    selector
    abi
    source
    sourceConfidence
  }

  query ContractFunction($input: ContractFunctionInput!) {
    contractFunction(input: $input) {
      ...ContractFunctionFields
    }
  }
`;

export interface ContractFunctionParams {
  contract?: Address;
  selector: Selector;
}

const isOp = (params?: ContractFunctionParams | Operation): params is Operation =>
  params !== undefined && 'to' in params;

export const useContractFunction = <P extends ContractFunctionParams | Operation | undefined>(
  params: P,
) => {
  const contract = isOp(params) ? params.to : params?.contract;
  const selector = isOp(params) ? asSelector(params.data) : params?.selector;

  const skip = !contract || !selector;
  const { data } = useSuspenseQuery<ContractFunctionQuery, ContractFunctionQueryVariables>(
    ContractFunctionDocument,
    {
      variables: { input: { contract: contract!, selector: selector! } },
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
