import gql from 'graphql-tag';
import { useSuspenseQuery } from './useSuspenseQuery';
import {
  CreateTestAccountMutation,
  CreateTestAccountMutationVariables,
  FirstAccountQuery,
  FirstAccountQueryVariables,
} from '../api.generated';
import { useMutation } from '@apollo/client';
import { useDevice } from '../hooks/useDevice';
import { useEffect, useState } from 'react';

const useFirstAccount = () => {
  const {
    data: { accounts },
  } = useSuspenseQuery<FirstAccountQuery, FirstAccountQueryVariables>(
    gql`
      query FirstAccount {
        accounts(take: 1) {
          id
        }
      }
    `,
    {
      variables: {},
    },
  );

  return accounts[accounts.length - 1]?.id;
};

const useCreateAccount = () =>
  useMutation<CreateTestAccountMutation, CreateTestAccountMutationVariables>(
    gql`
      mutation CreateTestAccount($name: String!, $users: [UserWithoutAccountInput!]!) {
        createAccount(name: $name, users: $users) {
          id
        }
      }
    `,
    {
      variables: {
        name: 'Test account',
        users: [
          {
            name: 'Test user',
            device: useDevice().address,
            configs: [{ approvers: [] }],
          },
        ],
      },
    },
  )[0];

export const useAccount = () => {
  // Query for an account
  const firstAccount = useFirstAccount();
  const createAccount = useCreateAccount();

  console.log({ device: useDevice().address });

  // Create an account if one doesn't exist
  const [account, setAccount] = useState<string | undefined>(firstAccount);
  useEffect(() => {
    (async () => {
      if (!account) {
        console.log('No account found, creating one');
        const { data } = await createAccount();
        console.log('Account created', data);
        if (data) setAccount(data.createAccount.id);
      }
    })();
  }, [account, createAccount]);

  return account;
};
