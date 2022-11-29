import React from 'react';
import gql from 'graphql-tag';
import Explorer from '@site/src/components/Explorer';
import {
  CreateAccountMutationVariables,
  AccountQueryVariables,
  AccountsQueryVariables,
} from '@site/src/api.generated';
import { useDevice } from '@site/src/hooks/useDevice';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useAccount } from '@site/src/api/useAccount';

const CreateAccountExampleInner = () => (
  <Explorer
    document={gql`
      mutation CreateAccount($name: String!, $users: [UserWithoutAccountInput!]!) {
        createAccount(name: $name, users: $users) {
          id
        }
      }
    `}
    variables={
      {
        name: 'Test account',
        users: [
          {
            name: 'Test user',
            device: useDevice().address,
            configs: [
              {
                approvers: [],
                limits: [],
              },
            ],
          },
        ],
      } as CreateAccountMutationVariables
    }
  />
);

export const CreateAccountExample = () => (
  <BrowserOnly>{() => <CreateAccountExampleInner />}</BrowserOnly>
);

export const AccountExample = () => {
  const account = useAccount();
  if (!account) return null;

  return (
    <Explorer
      document={gql`
        query Account($id: Address!) {
          account(id: $id) {
            id
            name
            isActive
            users {
              deviceId
            }
          }
        }
      `}
      variables={{ id: account } as AccountQueryVariables}
    />
  );
};

export const AccountsExample = () => {
  const account = useAccount();
  if (!account) return null;

  return (
    <Explorer
      document={gql`
        query Accounts {
          accounts {
            id
            name
            isActive
            users {
              deviceId
            }
          }
        }
      `}
      variables={{} as AccountsQueryVariables}
    />
  );
};
