import { gql } from '@apollo/client';
import { useWallet } from '@features/wallet/useWallet';
import { useUserSafesQuery } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { address, connectSafe, toId } from 'lib';
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

export const API_USER_SAFES_QUERY = gql`
  ${API_SAFE_FIELDS}

  query UserSafes {
    userSafes {
      ...SafeFields
    }
  }
`;

export const useApiUserSafes = () => {
  const wallet = useWallet();

  const { data, ...rest } = useUserSafesQuery({
    client: useApiClient(),
    pollInterval: QUERY_SAFE_POLL_INTERVAL,
  });

  const safes = useMemo(
    (): CombinedSafe[] =>
      data?.userSafes.map((safe) => ({
        id: toId(safe.id),
        contract: connectSafe(safe.id, wallet),
        impl: safe.impl ? address(safe.impl) : SAFE_IMPL,
        deploySalt: safe.deploySalt || undefined,
        name: safe.name,
      })) ?? [],
    [data?.userSafes, wallet],
  );

  return { data: safes, ...rest };
};
