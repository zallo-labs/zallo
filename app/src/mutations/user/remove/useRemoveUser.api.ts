import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import produce from 'immer';
import { getUserIdStr } from 'lib';
import { useCallback } from 'react';
import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
  useRemoveUserMutation,
  UserIdsDocument,
  UserIdsQuery,
  UserIdsQueryVariables,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { QueryOpts } from '~/gql/update';
import { CombinedUser } from '~/queries/user/useUser.api';

gql`
  mutation RemoveUser($id: UserIdInput!, $proposalHash: Bytes32!) {
    removeUser(id: $id, proposalHash: $proposalHash) {
      id
    }
  }
`;

export const useApiRemoveUser = () => {
  const device = useDevice();

  const [mutation] = useRemoveUserMutation({
    client: useApiClient(),
  });

  return useCallback(
    (user: CombinedUser, proposalHash: string | undefined) =>
      mutation({
        variables: {
          proposalHash,
          id: {
            account: user.account,
            device: user.addr,
          },
        },
        optimisticResponse: {
          removeUser: {
            id: getUserIdStr(user.account, user.addr),
          },
        },
        update: async (cache, res) => {
          const id = res.data?.removeUser?.id;
          if (!id) return;

          await Promise.all([removeUserFromAccount(), removeUserFromUserIds()]);
          removeUser();

          // Account: remove user
          async function removeUserFromAccount() {
            const opts: QueryOpts<AccountQueryVariables> = {
              query: AccountDocument,
              variables: { account: user.account },
            };

            const data = cache.readQuery<AccountQuery>(opts);
            if (!data?.account.users) return;

            cache.writeQuery<AccountQuery>({
              ...opts,
              overwrite: true,
              data: produce(data, (data) => {
                data.account.users = data.account.users?.filter(
                  (u) => u.deviceId !== user.addr,
                );
              }),
            });
          }

          // UserIds: remove user if it exists and is from the device
          async function removeUserFromUserIds() {
            if (device.address !== user.addr) return;

            const opts: QueryOpts<UserIdsQueryVariables> = {
              query: UserIdsDocument,
              variables: {},
            };

            const data = cache.readQuery<UserIdsQuery>(opts);
            if (!data?.users) return;

            cache.writeQuery<UserIdsQuery>({
              ...opts,
              overwrite: true,
              data: produce(data, (data) => {
                data.users = data.users?.filter(
                  (u) => u.accountId !== user.account,
                );
              }),
            });
          }

          // User: evict from cache
          async function removeUser() {
            cache.evict({
              id: cache.identify({
                __typename: 'User',
                id,
              }),
            });
          }
        },
      }),
    [mutation, device.address],
  );
};
