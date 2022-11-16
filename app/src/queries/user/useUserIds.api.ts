import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import { address, UserId } from 'lib';
import { useMemo } from 'react';
import { UserIdsDocument, UserIdsQuery, UserIdsQueryVariables } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

gql`
  query UserIds {
    users {
      id
      accountId
    }
  }
`;

export const useUserIds = () => {
  const device = useDevice();

  const { data, ...rest } = useSuspenseQuery<UserIdsQuery, UserIdsQueryVariables>(UserIdsDocument, {
    client: useApiClient(),
  });
  usePollWhenFocussed(rest, 30);

  const userIds = useMemo(
    (): UserId[] =>
      data.users.map((u) => ({
        account: address(u.accountId),
        addr: device.address,
      })),
    [data.users, device.address],
  );

  return [userIds, rest] as const;
};
