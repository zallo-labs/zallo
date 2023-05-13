import { gql } from '@apollo/client';
import { Address } from 'lib';
import { useSuspenseQuery } from '~/gql/util';
import { useMemo } from 'react';
import { UserDocument, UserQuery, UserQueryVariables } from '@api/generated';
import { User } from './types';

gql`
  query User($input: UserInput) {
    user(input: $input) {
      id
      address
      name
    }
  }
`;

export const useUser = (address?: Address) => {
  const { data } = useSuspenseQuery<UserQuery, UserQueryVariables>(UserDocument, {
    variables: {
      input: { address },
    },
  });

  return useMemo(
    (): User => ({
      address: data.user.address,
      name: data.user.name || undefined,
    }),
    [data.user],
  );
};
