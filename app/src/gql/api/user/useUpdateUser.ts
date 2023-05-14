import { gql } from '@apollo/client';
import { useCallback } from 'react';
import { useUpdateUserMutation } from '@api/generated';
import { useUser } from './useUser';
import { RequireAtLeastOne } from '~/util/typing';

gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      address
      name
    }
  }
`;

export type UpdateUserOptions = RequireAtLeastOne<{
  name: string | null;
  pushToken: string | null;
}>;

export const useUpdateUser = () => {
  const user = useUser();
  const [mutation] = useUpdateUserMutation();

  return useCallback(
    ({ name, pushToken }: UpdateUserOptions) => {
      return mutation({
        variables: {
          input: {
            name,
            pushToken,
          },
        },
        optimisticResponse: {
          updateUser: {
            __typename: 'User',
            id: user.address,
            address: user.address,
            name: name !== undefined ? name : user.name || null,
          },
        },
      });
    },
    [mutation, user.address, user.name],
  );
};
