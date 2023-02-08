import { gql } from '@apollo/client';
import {
  ContractMethodDocument,
  ContractMethodQuery,
  ContractMethodQueryVariables,
} from '~/gql/generated.api';
import { Contract } from 'ethers';
import { FunctionFragment, Interface } from 'ethers/lib/utils';
import { Call, getDataSighash } from 'lib';
import { useMemo } from 'react';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';
import assert from 'assert';

export interface ContractMethod {
  sighash: string;
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
  const sighash = getDataSighash(call?.data);

  const skip = !call || !sighash;
  const { data } = useSuspenseQuery<ContractMethodQuery, ContractMethodQueryVariables>(
    ContractMethodDocument,
    {
      variables: { contract: call?.to, sighash },
      skip,
    },
  );

  const method = useMemo((): ContractMethod | undefined => {
    if (!sighash || !data.contractMethod) return undefined;

    const fragment = FunctionFragment.from(data.contractMethod.fragment);

    return {
      sighash,
      fragment,
      contract: Contract.getInterface([fragment]),
    };
  }, [data.contractMethod, sighash]);

  if (!skip) assert(method);
  return method as Call extends undefined ? ContractMethod | undefined : ContractMethod;
};
