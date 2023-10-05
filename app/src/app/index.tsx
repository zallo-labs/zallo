import { Redirect, SearchParams } from 'expo-router';
import { useQuery } from '~/gql';

import { gql } from '@api';

const Query = gql(/* GraphQL */ `
  query RootScreen {
    accounts {
      id
      address
    }
  }
`);

export type RootScreenRoute = `/`;
export type RootScreenParams = SearchParams<RootScreenRoute>;

export default function RootScreen() {
  const accounts = useQuery(Query).data?.accounts ?? [];

  return accounts.length ? (
    <Redirect href={{ pathname: `/[account]/`, params: { account: accounts[0].address } }} />
  ) : (
    <Redirect href={`/onboard/`} />
  );
}
