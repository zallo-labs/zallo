import {
  ContractFunctionDocument,
  ContractFunctionQuery,
  ContractFunctionQueryVariables,
} from '@api/generated';
import { Address, Operation, Selector, asSelector } from 'lib';
import { useMemo } from 'react';
import { fragmentToContractFunction } from './types';
import { useQuery } from '~/gql';
import { gql } from '@api/gen';

gql(/* GraphQL */ `
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
`);

export interface ContractFunctionParams {
  contract?: Address;
  selector: Selector;
}

const isOp = (params?: ContractFunctionParams | Operation): params is Operation =>
  params !== undefined && 'to' in params;

export const useContractFunction = (params: ContractFunctionParams | Operation | undefined) => {
  const contract = isOp(params) ? params.to : params?.contract;
  const selector = isOp(params) ? asSelector(params.data) : params?.selector;

  const { data } = useQuery<ContractFunctionQuery, ContractFunctionQueryVariables>(
    ContractFunctionDocument,
    { input: { contract: contract!, selector: selector! } },
    { pause: !contract || !selector },
  );

  return useMemo(
    () => (data?.contractFunction ? fragmentToContractFunction(data.contractFunction) : undefined),
    [data],
  );
};
