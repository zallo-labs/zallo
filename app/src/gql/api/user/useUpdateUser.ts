import { gql } from '@apollo/client';
import { useCallback } from 'react';
import { useUpdateUserMutation } from '@api/generated';
import { useUser } from './useUser';
import { RequireAtLeastOne } from '~/util/typing';

gql`
  mutation UpdateUser($name: String, $pushToken: String) {
    updateUser(name: $name, pushToken: $pushToken) {
      id
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
          name,
          pushToken,
        },
        optimisticResponse: {
          updateUser: {
            __typename: 'User',
            id: user.id,
            name: name !== undefined ? name : user.name || null,
          },
        },
      });
    },
    [mutation, user.id, user.name],
  );
};
