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
      mutation CreateAccount($name: String!, $quorums: [QuorumInput!]!) {
        createAccount(name: $name, quorums: $quorums) {
          id
        }
      }
    `}
    variables={
      {
        name: 'Test account',
        quorums: [{ name: 'Test quorum', approvers: [useDevice().address] }],
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
        query Account($id: Address!) {
          account(id: $id) {
            id
            name
            isActive
            quorums {
              key
            }
          }
        }
      `}
      variables={{ id: account } as AccountQueryVariables}
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
            quorums {
              key
            }
          }
        }
      `}
      variables={{} as AccountsQueryVariables}
    />
  );
});
