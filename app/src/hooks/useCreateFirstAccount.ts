import { gql } from '@api';
import { useApproverAddress } from '@network/useApprover';
import { useRouter } from 'expo-router';
import { Address } from 'lib';
import { useMutation } from 'urql';
import { showError } from '~/components/provider/SnackbarProvider';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query UseCreateFirstAccount {
    accounts {
      id
      address
    }
  }
`);

const Create = gql(/* GraphQL */ `
  mutation UseCreateFirstAccount_Create($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
      address
    }
  }
`);

export function useCreateFirsAccount() {
  const router = useRouter();
  const approver = useApproverAddress();
  const create = useMutation(Create)[1];

  const { accounts } = useQuery(Query).data;

  const nav = (account: Address) =>
    router.push({ pathname: `/(drawer)/[account]/(home)/`, params: { account } });

  return async () => {
    if (accounts?.length) return nav(accounts[0].address);

    try {
      const account = (
        await create({
          input: {
            name: 'Personal',
            policies: [{ name: 'High risk', approvers: [approver] }],
          },
        })
      ).data?.createAccount;

      nav(account!.address);
    } catch (error) {
      showError('Failed to create account', { event: { error } });
    }
  };
}
