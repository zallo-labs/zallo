import {
  ContractDocument,
  ContractFunctionFieldsFragmentDoc,
  ContractQuery,
  ContractQueryVariables,
} from '@api/generated';
import { Address } from 'lib';
import { useMemo } from 'react';
import { ContractFunction, fragmentToContractFunction } from './types';
import { gql } from '@api/gen';
import { useQuery } from '~/gql';

gql(/* GraphQL */ `
  ${ContractFunctionFieldsFragmentDoc}

  query Contract($input: ContractInput!) {
    contract(input: $input) {
      id
      functions {
        ...ContractFunctionFields
      }
    }
  }
`);

export const useContractFunctions = (contract: Address | undefined) => {
  const { data } = useQuery<ContractQuery, ContractQueryVariables>(
    ContractDocument,
    { input: { contract: contract! } },
    { pause: !contract },
  );

  return useMemo(
    (): ContractFunction[] => data?.contract?.functions?.map(fragmentToContractFunction) || [],
    [data],
  );
};
