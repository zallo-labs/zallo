import { gql } from '@apollo/client';
import { useApiClient } from '~/gql/GqlProvider';
import { updateQuery } from '~/gql/update';
import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
  useCreateAccountMutation,
  UserIdsDocument,
  UserIdsQuery,
  UserIdsQueryVariables,
} from '~/gql/generated.api';
import {
  Address,
  calculateProxyAddress,
  getUserIdStr,
  randomDeploySalt,
  User,
  UserId,
} from 'lib';
import { ACCOUNT_IMPL } from '~/util/network/provider';
import { useDevice } from '@network/useDevice';
import { useAccountProxyFactory } from '@network/useAccountProxyFactory';

gql`
  mutation CreateAccount(
    $account: Address!
    $impl: Address!
    $deploySalt: Bytes32!
    $name: String!
    $users: [UserWithoutAccountInput!]!
  ) {
    createAccount(
      account: $account
      impl: $impl
      deploySalt: $deploySalt
      name: $name
      users: $users
    ) {
      id
    }
  }
`;

export interface CreateAccountResult {
  account: Address;
  user: UserId;
}

export const useCreateAccount = () => {
  const device = useDevice();
  const factory = useAccountProxyFactory();
  const [mutation] = useCreateAccountMutation({ client: useApiClient() });

  return async (
    name: string,
    userName: string,
  ): Promise<CreateAccountResult> => {
    const user: User = {
      addr: device.address,
      configs: [
        {
          approvers: [],
          spendingAllowlisted: false,
          limits: {},
        },
      ],
    };
    const impl = ACCOUNT_IMPL;
    const deploySalt = randomDeploySalt();

    const account = await calculateProxyAddress(
      { impl, user },
      factory,
      deploySalt,
    );

    await mutation({
      variables: {
        account,
        impl,
        deploySalt,
        name,
        users: [
          {
            name: userName,
            device: user.addr,
            configs: user.configs.map((c) => ({
              approvers: c.approvers,
              spendingAllowlisted: c.spendingAllowlisted,
              limits: Object.values(c.limits),
            })),
          },
        ],
      },
      // TODO: reconsider, now that the userIds/accountIds issue is fixed
      // Don't update optimistically, as the data won't be available on the api yet otherwise
      // optimisticResponse: {
      //   createAccount: {
      //     __typename: 'Account',
      //     id: toId(accountAddr),
      //   },
      // },
      update: (cache, res) => {
        const id = res.data?.createAccount.id;
        if (!id) return;

        {
          // Account: add
          cache.writeQuery<AccountQuery, AccountQueryVariables>({
            query: AccountDocument,
            variables: { account },
            data: {
              account: {
                id,
                deploySalt,
                impl,
                isDeployed: false,
                name,
                users: [
                  {
                    deviceId: user.addr,
                    name: '', // TODO: use device's name
                  },
                ],
              },
            },
          });
        }

        {
          // UserIds: add
          updateQuery<UserIdsQuery, UserIdsQueryVariables>({
            cache,
            query: UserIdsDocument,
            variables: {},
            defaultData: { users: [] },
            updater: (data) => {
              const i = data.users.findIndex((u) => u.id === id);
              data.users[i >= 0 ? i : data.users.length] = {
                id: getUserIdStr(account, device.address),
                accountId: account,
              };
            },
          });
        }
      },
    });

    return {
      account,
      user: {
        account,
        addr: device.address,
      },
    };
  };
};
