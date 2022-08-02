import { gql, useQuery } from '@apollo/client';
import { useWallet } from '@features/wallet/useWallet';
import { SafeQuery, SafeQueryVariables } from '@gql/generated.sub';
import { useSubgraphClient } from '@gql/GqlProvider';
import { Address, address, connectSafe, toId } from 'lib';
import { useMemo } from 'react';
import { QUERY_SAFE_POLL_INTERVAL, CombinedSafe } from '.';

const QUERY = gql`
  query Safe($safe: ID!) {
    safe(id: $safe) {
      impl {
        id
      }
    }
  }
`;

export const useSubSafe = (safeAddr: Address) => {
  const wallet = useWallet();

  const { data, ...rest } = useQuery<SafeQuery, SafeQueryVariables>(QUERY, {
    client: useSubgraphClient(),
    variables: { safe: toId(safeAddr) },
    pollInterval: QUERY_SAFE_POLL_INTERVAL,
  });

  const safe = useMemo(
    (): CombinedSafe | undefined =>
      data?.safe
        ? {
            id: toId(safeAddr),
            contract: connectSafe(safeAddr, wallet),
            impl: address(data.safe.impl.id),
            name: '',
          }
        : undefined,
    [data?.safe, safeAddr, wallet],
  );

  return { data: safe, ...rest };
};
