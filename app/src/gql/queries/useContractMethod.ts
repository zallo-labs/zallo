import { useQuery } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import {
  GetContractMethod,
  GetContractMethodVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { Contract } from 'ethers';
import { ethers } from 'ethers';
import { BytesLike } from 'ethers';
import { FunctionFragment } from 'ethers/lib/utils';
import { Address, Safe__factory } from 'lib';
import { useMemo } from 'react';

const SAFE_INTERFACE = Safe__factory.createInterface();

const API_QUERY = apiGql`
query GetContractMethod($contract: Address!, $sighash: Bytes!) {
  contractMethod(contract: $contract, sighash: $sighash) {
    id
    fragment
  }
}
`;

export const getSighash = (data: BytesLike): string =>
  ethers.utils.hexDataSlice(data, 0, 4);

export const useContractMethod = (contract: Address, funcData: BytesLike) => {
  const { safe } = useSafe();
  const isSafe = contract === safe.address;

  const sighash = useMemo(() => getSighash(funcData), [funcData]);

  const { data, ...rest } = useQuery<
    GetContractMethod,
    GetContractMethodVariables
  >(API_QUERY, {
    client: useApiClient(),
    variables: { contract, sighash },
    skip: isSafe,
  });

  const methodFragment: FunctionFragment | undefined = useMemo(
    () =>
      isSafe
        ? SAFE_INTERFACE.getFunction(sighash as any)
        : data
        ? FunctionFragment.from(JSON.parse(data?.contractMethod.fragment))
        : undefined,
    [isSafe, data, sighash],
  );

  const methodInterface = useMemo(
    () =>
      methodFragment ? Contract.getInterface([methodFragment]) : undefined,
    [methodFragment],
  );

  return { methodFragment, methodInterface, ...rest };
};
