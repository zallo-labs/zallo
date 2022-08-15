import { ApolloQueryResult, gql, useQuery } from '@apollo/client';
import {
  ContractMethodQuery,
  ContractMethodQueryVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { Contract } from 'ethers';
import { ethers } from 'ethers';
import { BytesLike } from 'ethers';
import { FunctionFragment } from 'ethers/lib/utils';
import { Address, Account__factory } from 'lib';
import { useMemo } from 'react';
import { useApiUserAccountsMetadata } from './account/useAccountsMetadata.api';

const ACCOUNT_INTERFACE = Account__factory.createInterface();

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
  isAccount: boolean,
) => {
  const methodFragment: FunctionFragment | undefined =
    sighash === '0x'
      ? undefined
      : isAccount
      ? ACCOUNT_INTERFACE.getFunction(sighash as any)
      : data?.contractMethod?.fragment
      ? FunctionFragment.from(JSON.parse(data.contractMethod.fragment))
      : undefined;

  const contractInterface = methodFragment
    ? Contract.getInterface([methodFragment])
    : undefined;

  const methodName =
    methodFragment?.name ?? (sighash === '0x' ? 'Send' : sighash);

  return {
    methodFragment,
    contractInterface,
    methodName,
    sighash,
  };
};

export const useContractMethod = (contract: Address, funcData: BytesLike) => {
  const { apiAccountsMetadata } = useApiUserAccountsMetadata();
  const sighash = getDataSighash(funcData);

  const isAccount = useMemo(
    () => !!apiAccountsMetadata.find((a) => a.addr === contract),
    [apiAccountsMetadata, contract],
  );

  const res = useQuery<ContractMethodQuery, ContractMethodQueryVariables>(
    API_QUERY,
    {
      client: useApiClient(),
      variables: { contract, sighash },
    },
  );

  return useMemo(
    () => transform(res?.data, sighash, isAccount),
    [isAccount, res?.data, sighash],
  );
};

// export const useLazyContractMethod = () => {
//   const { contract: account } = useAccount();
//   const client = useApiClient();

//   const get = useCallback(
//     async (contract: Address, funcData: BytesLike) => {
//       const isAccount = contract === account.address;
//       const sighash = getDataSighash(funcData);

//       const result = await client.query<
//         ContractMethodQuery,
//         ContractMethodQueryVariables
//       >({
//         query: API_QUERY,
//         variables: { contract, sighash },
//       });

//       return transform(result?.data, sighash, isAccount);
//     },
//     [account.address, client],
//   );

//   return get;
// };
