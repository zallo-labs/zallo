import { gql } from '@apollo/client';
import {
  ContractMethodDocument,
  ContractMethodQuery,
  ContractMethodQueryVariables,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { Contract } from 'ethers';
import { FunctionFragment, Interface } from 'ethers/lib/utils';
import { Call, getDataSighash, tryOrDefault } from 'lib';
import { useMemo } from 'react';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

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

export const useContractMethod = (call?: Call) => {
  const sighash = getDataSighash(call?.data);

  const { data } = useSuspenseQuery<ContractMethodQuery, ContractMethodQueryVariables>(
    ContractMethodDocument,
    {
      client: useApiClient(),
      variables: { contract: call?.to, sighash },
      skip: !call || !sighash,
    },
  );

  const method = useMemo((): ContractMethod | undefined => {
    const fragment = tryOrDefault(
      () => FunctionFragment.from(JSON.parse(data?.contractMethod?.fragment)),
      undefined,
    );
    if (!fragment || !sighash) return undefined;

    return {
      sighash,
      fragment,
      contract: Contract.getInterface([fragment]),
    };
  }, [data?.contractMethod?.fragment, sighash]);

  return method;
};
