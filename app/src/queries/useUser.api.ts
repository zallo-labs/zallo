import { gql } from '@apollo/client';
import { address, Address } from 'lib';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';
import { useMemo } from 'react';
import { UserDocument, UserQuery, UserQueryVariables } from '~/gql/generated.api';
import assert from 'assert';

export interface User {
  id: Address;
  name?: string;
  pushToken?: string;
}

gql`
  query User($id: Address) {
    user(id: $id) {
      id
      name
      pushToken
    }
  }
`;

export const useUser = (id?: Address) => {
  const { data } = useSuspenseQuery<UserQuery, UserQueryVariables>(UserDocument, {
    variables: { id },
  });

  const u = data.user;
  assert(u);

  return useMemo(
    (): User => ({
      id: address(u.id),
      name: u.name || undefined,
      pushToken: u.pushToken || undefined,
    }),
    [u.id, u.name, u.pushToken],
  );
};
