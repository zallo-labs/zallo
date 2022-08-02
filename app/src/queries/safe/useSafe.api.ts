import { gql, useQuery } from '@apollo/client';
import { useWallet } from '@features/wallet/useWallet';
import { SafeQuery, SafeQueryVariables } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { Address, address, connectSafe, Id, toId } from 'lib';
import { useMemo } from 'react';
import { SAFE_IMPL } from '~/provider';
import { CombinedSafe, QUERY_SAFE_POLL_INTERVAL } from '.';

export const API_SAFE_FIELDS = gql`
  fragment SafeFields on Safe {
    id
    name
    impl
    deploySalt
  }
`;

export const API_SAFE_QUERY = gql`
  query Safe($id: Address!) {
    safe(id: $id) {
      ...SafeFields
    }
  }
`;

export const useApiSafe = (safeAddr: Address) => {
  const wallet = useWallet();

  const { data, ...rest } = useQuery<SafeQuery, SafeQueryVariables>(
    API_SAFE_QUERY,
    {
      client: useApiClient(),
      variables: { id: safeAddr },
      pollInterval: QUERY_SAFE_POLL_INTERVAL,
    },
  );

  const safe = useMemo(
    (): CombinedSafe | undefined =>
      data?.safe
        ? {
            id: toId(safeAddr),
            contract: connectSafe(safeAddr, wallet),
            impl: data.safe.impl ? address(data.safe.impl) : SAFE_IMPL,
            deploySalt: data.safe.deploySalt || undefined,
            name: data.safe.name,
          }
        : undefined,
    [data?.safe, safeAddr, wallet],
  );

  return { data: safe, ...rest };
};
