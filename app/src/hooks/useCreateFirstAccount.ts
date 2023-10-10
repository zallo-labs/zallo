import { gql } from '@api';
import { useRouter } from 'expo-router';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query CreateFirstAccount {
    accounts {
      id
      address
    }
  }
`);

export function useCreateFirsAccount() {
  const router = useRouter();
  const { accounts } = useQuery(Query).data;

  return async () =>
    accounts?.length
      ? router.push({ pathname: `/[account]/(home)/`, params: { account: accounts[0].address } })
      : router.push(`/accounts/create`);
}
