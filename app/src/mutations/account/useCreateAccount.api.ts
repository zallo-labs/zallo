import { gql } from '@apollo/client';
import { useApiClient } from '~/gql/GqlProvider';
import { QueryOpts } from '~/gql/update';
import {
  AccountDocument,
  AccountIdsDocument,
  AccountIdsQuery,
  AccountIdsQueryVariables,
  AccountQuery,
  AccountQueryVariables,
  useCreateAccountMutation,
} from '~/gql/generated.api';
import { calculateProxyAddress, randomDeploySalt, toId, User } from 'lib';
import produce from 'immer';
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

export const useCreateAccount = () => {
  const device = useDevice();
  const factory = useAccountProxyFactory();
  const [mutation] = useCreateAccountMutation({ client: useApiClient() });

  return async (name: string, userName: string) => {
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

    const accountAddr = await calculateProxyAddress(
      { impl, user },
      factory,
      deploySalt,
    );

    return await mutation({
      variables: {
        account: accountAddr,
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
            variables: { account: accountAddr },
            data: {
              account: {
                id,
                deploySalt,
                impl,
                isDeployed: false,
                name,
                users: [{ deviceId: user.addr }],
                deployUser: { deviceId: user.addr },
              },
            },
          });
        }

        {
          // AccountIds: add
          const opts: QueryOpts<AccountIdsQueryVariables> = {
            query: AccountIdsDocument,
            variables: {},
          };

          const data = cache.readQuery<AccountIdsQuery>(opts) ?? {
            accounts: [],
          };

          cache.writeQuery<AccountIdsQuery>({
            ...opts,
            overwrite: true,
            data: produce(data, (data) => {
              data.accounts.push({ id });
            }),
          });
        }
      },
    });
  };
};
