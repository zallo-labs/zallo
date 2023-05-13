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

const useFirstAccount = (): string | undefined =>
  useSuspenseQuery<FirstAccountQuery, FirstAccountQueryVariables>(
    gql`
      query FirstAccount {
        accounts {
          id
          address
        }
      }
    `,
    {
      variables: {},
    },
  ).data.accounts[0]?.address;

const useCreateAccount = () =>
  useMutation<CreateTestAccountMutation, CreateTestAccountMutationVariables>(
    gql`
      mutation CreateTestAccount($input: CreateAccountInput!) {
        createAccount(input: $input) {
          id
        }
      }
    `,
    {
      variables: {
        input: {
          name: 'Test account',
          policies: [{ name: 'Admin policy', approvers: [useDevice().address], permissions: {} }],
        },
      },
    },
  );

export const useAccount = () => {
  // Query for an account
  const firstAccount = useFirstAccount();
  const [createAccount] = useCreateAccount();

  // Create an account if one doesn't exist
  const [account, setAccount] = useState<string | undefined>(firstAccount);
  useEffect(() => {
    (async () => {
      if (!account) {
        const { data } = await createAccount();
        if (data) setAccount(data.createAccount.id);
      }
    })();
  }, [account, createAccount]);

  return account;
};
