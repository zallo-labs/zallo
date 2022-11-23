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
import { address, Address, getUserIdStr, User, UserId } from 'lib';
import { useDevice } from '@network/useDevice';

gql`
  mutation CreateAccount($name: String!, $users: [UserWithoutAccountInput!]!) {
    createAccount(name: $name, users: $users) {
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
  const [mutation] = useCreateAccountMutation({ client: useApiClient() });

  return async (name: string, userName: string): Promise<CreateAccountResult> => {
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

    const r = await mutation({
      variables: {
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
      update: (cache, res) => {
        const id = res.data?.createAccount.id;
        if (!id) return;

        {
          // Account: add
          cache.writeQuery<AccountQuery, AccountQueryVariables>({
            query: AccountDocument,
            variables: { account: id },
            data: {
              account: {
                id,
                isDeployed: false,
                name,
                users: [
                  {
                    deviceId: user.addr,
                    name: userName,
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

    const account = address(r.data!.createAccount.id);

    return {
      account,
      user: {
        account,
        addr: device.address,
      },
    };
  };
};
