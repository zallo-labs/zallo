import { ApolloQueryResult, gql, useQuery } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import {
  ContractMethodQuery,
  ContractMethodQueryVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { Contract } from 'ethers';
import { ethers } from 'ethers';
import { BytesLike } from 'ethers';
import { FunctionFragment } from 'ethers/lib/utils';
import { Address, Safe__factory } from 'lib';
import { useCallback } from 'react';

const SAFE_INTERFACE = Safe__factory.createInterface();

const API_QUERY = gql`
  query ContractMethod($contract: Address!, $sighash: Bytes!) {
    contractMethod(contract: $contract, sighash: $sighash) {
      id
      fragment
    }
  }
`;

export const getDataSighash = (data: BytesLike): string =>
  ethers.utils.hexDataSlice(data, 0, 4);

const transform = (
  data: ApolloQueryResult<ContractMethodQuery>['data'] | undefined,
  sighash: string,
  isSafe: boolean,
) => {
  const methodFragment: FunctionFragment | undefined =
    sighash === '0x'
      ? undefined
      : isSafe
      ? SAFE_INTERFACE.getFunction(sighash as any)
      : data?.contractMethod?.fragment
      ? FunctionFragment.from(JSON.parse(data.contractMethod.fragment))
      : undefined;

  const methodInterface = methodFragment
    ? Contract.getInterface([methodFragment])
    : undefined;

  const methodName =
    methodFragment?.name ?? (sighash === '0x' ? 'Send' : sighash);

  return { methodFragment, methodInterface, methodName, sighash };
};

export const useContractMethod = (contract: Address, funcData: BytesLike) => {
  const { contract: safe } = useSafe();

  const isSafe = contract === safe.address;
  const sighash = getDataSighash(funcData);

  const res = useQuery<ContractMethodQuery, ContractMethodQueryVariables>(
    API_QUERY,
    {
      client: useApiClient(),
      variables: { contract, sighash },
    },
  );

  return transform(res?.data, sighash, isSafe);
};

export const useLazyContractMethod = () => {
  const { contract: safe } = useSafe();
  const client = useApiClient();

  const get = useCallback(
    async (contract: Address, funcData: BytesLike) => {
      const isSafe = contract === safe.address;
      const sighash = getDataSighash(funcData);

      const result = await client.query<
        ContractMethodQuery,
        ContractMethodQueryVariables
      >({
        query: API_QUERY,
        variables: { contract, sighash },
      });

      return transform(result?.data, sighash, isSafe);
    },
    [safe.address, client],
  );

  return get;
};
