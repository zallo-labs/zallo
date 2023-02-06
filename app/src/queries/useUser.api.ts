import { gql } from '@apollo/client';
import { address, Address } from 'lib';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';
import { useMemo } from 'react';
import { UserDocument, UserQuery, UserQueryVariables } from '~/gql/generated.api';
import assert from 'assert';

export interface User {
  id: Address;
  name?: string;
}

gql`
  query User($id: Address) {
    user(id: $id) {
      id
      name
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
    }),
    [u.id, u.name],
  );
};
