import React from 'react';
import gql from 'graphql-tag';
import Explorer from '@site/src/components/Explorer';
import {
  CreateAccountMutationVariables,
  AccountQueryVariables,
  AccountsQueryVariables,
} from '@site/src/api.generated';
import { useDevice } from '@site/src/hooks/useDevice';
import { useAccount } from '@site/src/api/useAccount';
import { Suspend } from '@site/src/components/Suspender';
import { withBrowser } from '@site/src/components/withBrowser';

export const CreateAccountExample = withBrowser(() => (
  <Explorer
    document={gql`
      mutation CreateAccount($input: CreateAccountInput!) {
        createAccount(input: $input) {
          id
        }
      }
    `}
    variables={
      {
        input: {
          name: 'Test account',
          policies: [{ name: 'Admin policy', approvers: [useDevice().address], permissions: {} }],
        },
      } as CreateAccountMutationVariables
    }
  />
));

export const AccountExample = withBrowser(() => {
  const account = useAccount();
  if (!account) return <Suspend />;

  return (
    <Explorer
      document={gql`
        query Account($input: AccountInput!) {
          account(input: $input) {
            id
            name
            isActive
            policies {
              name
              key
            }
          }
        }
      `}
      variables={{ input: { address: account } } as AccountQueryVariables}
    />
  );
});

export const AccountsExample = withBrowser(() => {
  const account = useAccount();
  if (!account) return <Suspend />;

  return (
    <Explorer
      document={gql`
        query Accounts {
          accounts {
            id
            name
            isActive
            policies {
              name
              key
            }
          }
        }
      `}
      variables={{} as AccountsQueryVariables}
    />
  );
});
