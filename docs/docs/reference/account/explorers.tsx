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

const CreateAccountExplorerInner = () => (
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
        name: 'My Account',
        users: [
          {
            name: 'Vitalik Buterin',
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

export const CreateAccountExplorer = () => (
  <BrowserOnly>{() => <CreateAccountExplorerInner />}</BrowserOnly>
);

export const AccountExplorer = () => (
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
    variables={
      {
        id: '0x0000000000000000000000000000000000000000',
      } as AccountQueryVariables
    }
  />
);

export const AccountsExplorer = () => (
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
