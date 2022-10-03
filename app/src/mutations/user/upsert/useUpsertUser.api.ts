import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import { getUserIdStr, UserConfig } from 'lib';
import { useCallback } from 'react';
import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
  UserConfigInput,
  UserDocument,
  UserIdInput,
  UserIdsDocument,
  UserIdsQuery,
  UserIdsQueryVariables,
  UserQuery,
  UserQueryVariables,
  useUpsertUserMutation,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { updateQuery } from '~/gql/update';
import { CombinedUser } from '~/queries/user/useUser.api';

gql`
  mutation UpsertUser($user: UserInput!, $proposalHash: Bytes32!) {
    upsertUser(user: $user, proposalHash: $proposalHash) {
      id
    }
  }
`;

const userConfigsToInput = (
  configs: UserConfig[],
): NonNullable<UserQuery['user']['proposedState']>['configs'] =>
  configs.map((c) => ({
    approvers: c.approvers.map((a) => ({
      deviceId: a,
    })),
    spendingAllowlisted: c.spendingAllowlisted,
    limits: Object.values(c.limits).map((l) => ({
      token: l.token,
      amount: l.amount.toString(),
      period: l.period,
    })),
  }));

export const useApiUpsertUser = () => {
  const device = useDevice();

  const [mutation] = useUpsertUserMutation({ client: useApiClient() });

  return useCallback(
    (user: CombinedUser, proposalHash: string) => {
      const idStr = getUserIdStr(user.account, user.addr);
      const id: UserIdInput = {
        account: user.account,
        device: user.addr,
      };

      return mutation({
        variables: {
          proposalHash,
          user: {
            id,
            name: user.name,
            configs: user.configs.value.map(
              (c): UserConfigInput => ({
                approvers: c.approvers,
                spendingAllowlisted: c.spendingAllowlisted,
                limits: Object.values(c.limits).map((l) => ({
                  token: l.token,
                  amount: l.amount.toString(),
                  period: l.period,
                })),
              }),
            ),
          },
        },
        // optimisticResponse: {
        //   upsertUser: {
        //     id: idStr,
        //   },
        // },
        // update: (cache, res) => {
        //   if (!res.data?.upsertUser.id) return;

        //   upsertUser();
        //   addToAccount();
        //   addToUserIds();

        //   // User: upsert
        //   function upsertUser() {
        //     cache.writeQuery<UserQuery, UserQueryVariables>({
        //       query: UserDocument,
        //       variables: {
        //         id,
        //       },
        //       overwrite: true,
        //       data: {
        //         user: {
        //           id: idStr,
        //           accountId: user.account,
        //           deviceId: user.addr,
        //           name: user.name,
        //           activeState: user.configs.active
        //             ? {
        //                 configs: userConfigsToInput(user.configs.active),
        //                 proposalHash: null,
        //               }
        //             : null,
        //           proposedState: user.configs.proposed
        //             ? {
        //                 configs: userConfigsToInput(user.configs.proposed),
        //                 proposalHash,
        //               }
        //             : null,
        //         },
        //       },
        //     });
        //   }

        //   // Account: add to users if missing
        //   async function addToAccount() {
        //     updateQuery<AccountQuery, AccountQueryVariables>({
        //       cache,
        //       query: AccountDocument,
        //       variables: { account: user.account },
        //       updater: (data) => {
        //         if (
        //           !data.account.users?.find((u) => u.deviceId === user.addr)
        //         ) {
        //           data.account.users = [
        //             ...(data.account.users ?? []),
        //             {
        //               deviceId: user.addr,
        //               name: user.name,
        //             },
        //           ];
        //         }
        //       },
        //     });
        //   }

        //   // UserIds: add if own device & missing
        //   async function addToUserIds() {
        //     if (user.addr === device.address) {
        //       updateQuery<UserIdsQuery, UserIdsQueryVariables>({
        //         cache,
        //         query: UserIdsDocument,
        //         variables: {},
        //         defaultData: { users: [] },
        //         updater: (data) => {
        //           if (!data.users.find((u) => u.id === idStr)) {
        //             data.users.push({
        //               id: idStr,
        //               accountId: user.account,
        //             });
        //           }
        //         },
        //       });
        //     }
        //   }
        // },
      });
    },
    [mutation, device.address],
  );
};
