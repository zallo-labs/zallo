import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import { AccountDocument, AccountQuery, AccountQueryVariables } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { Account, Address, address, connectAccount, UserId } from 'lib';
import { useMemo } from 'react';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

export interface UserMetadata extends UserId {
  name: string;
}

export interface CombinedAccount {
  addr: Address;
  contract: Account;
  impl: Address;
  name: string;
  active?: boolean;
  users: UserMetadata[];
}

gql`
  query Account($account: Address!) {
    account(id: $account) {
      id
      deploySalt
      impl
      isDeployed
      name
      users {
        deviceId
        name
      }
    }
  }
`;

export const useAccount = (id: Address | UserId) => {
  const device = useDevice();
  const addr = typeof id === 'string' ? id : id.account;

  const { data, ...rest } = useSuspenseQuery<AccountQuery, AccountQueryVariables>(AccountDocument, {
    client: useApiClient(),
    variables: { account: addr },
  });
  usePollWhenFocussed(rest, 30);

  const a = data.account;
  const account = useMemo(
    (): CombinedAccount => ({
      addr,
      contract: connectAccount(addr, device),
      impl: address(a.impl),
      active: a.isDeployed,
      name: a.name,
      users:
        a.users?.map((u) => ({
          account: addr,
          addr: address(u.deviceId),
          name: u.name,
        })) ?? [],
    }),
    [addr, device, a],
  );

  return [account, rest] as const;
};
