import { gql } from '@apollo/client';
import { useCallback } from 'react';
import { UserDocument, UserQuery, UserQueryVariables, useUpdateUserMutation } from '@api/generated';
import { updateQuery } from '~/gql/util';
import { useUser } from './useUser.api';
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
            id: user.id,
            name: name !== undefined ? name : user.name,
          },
        },
        update: (cache, res) => {
          const u = res.data?.updateUser;
          if (!u) return;

          updateQuery<UserQuery, UserQueryVariables>({
            cache,
            query: UserDocument,
            updater: (data) => {
              data.user = u;
            },
          });
        },
      });
    },
    [mutation, user.id, user.name],
  );
};
