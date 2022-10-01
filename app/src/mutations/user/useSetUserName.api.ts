import { gql } from '@apollo/client';
import produce from 'immer';
import { getUserIdStr } from 'lib';
import { useCallback } from 'react';
import {
  UserDocument,
  UserIdInput,
  UserQuery,
  UserQueryVariables,
  useSetUserNameMutation,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { QueryOpts } from '~/gql/update';
import { CombinedUser } from '~/queries/user/useUser.api';

gql`
  mutation SetUserName($user: UserIdInput!, $name: String!) {
    setUserName(id: $user, name: $name) {
      id
    }
  }
`;

export const useSetUserName = (user: CombinedUser) => {
  const [mutation] = useSetUserNameMutation({
    client: useApiClient(),
  });

  return useCallback(
    (name: string) => {
      if (user.name === name) return undefined;

      const id: UserIdInput = {
        account: user.account,
        device: user.addr,
      };

      mutation({
        variables: {
          user: id,
          name,
        },
        optimisticResponse: {
          setUserName: {
            id: getUserIdStr(user.account, user.addr),
          },
        },
        update: (cache, res) => {
          if (!res.data?.setUserName?.id) return;

          // User: set name
          const opts: QueryOpts<UserQueryVariables> = {
            query: UserDocument,
            variables: { id },
          };

          const data = cache.readQuery<UserQuery>(opts);
          if (!data) return;

          cache.writeQuery<UserQuery>({
            ...opts,
            overwrite: true,
            data: produce(data, (data) => {
              data.user.name = name;
            }),
          });
        },
      });
    },
    [mutation, user.account, user.addr, user.name],
  );
};
