import {
  ContractDocument,
  ContractFunctionFieldsFragmentDoc,
  ContractQuery,
  ContractQueryVariables,
} from '@api/generated';
import { gql } from '@apollo/client';
import { Address } from 'lib';
import { useMemo } from 'react';
import { useSuspenseQuery } from '~/gql/util';
import { ContractFunction, fragmentToContractFunction } from './types';

gql`
  ${ContractFunctionFieldsFragmentDoc}

  query Contract($input: ContractInput!) {
    contract(input: $input) {
      id
      functions {
        ...ContractFunctionFields
      }
    }
  }
`;

export const useContractFunctions = (contract: Address | undefined) => {
  const { data } = useSuspenseQuery<ContractQuery, ContractQueryVariables>(ContractDocument, {
    variables: { input: { contract: contract! } },
    skip: !contract,
  });

  return useMemo(
    (): ContractFunction[] => data.contract?.functions?.map(fragmentToContractFunction) || [],
    [data],
  );
};
