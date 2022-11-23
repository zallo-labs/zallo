import React, { Suspense } from 'react';
import Explorer from '@site/src/components/Explorer';
import gql from 'graphql-tag';
import { CreateAccountMutationVariables } from '@site/src/api.generated';
import { useDevice } from '@site/src/hooks/useDevice';
import { RecoilRoot } from 'recoil';

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
  <Suspense fallback={null}>
    <RecoilRoot>
      <CreateAccountExplorerInner />
    </RecoilRoot>
  </Suspense>
);
