import { Screen } from '~/components/layout/Screen';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { HomeAppbar } from './HomeAppbar';
import { QuickActions } from './QuickActions';
import { Tabs } from './Tabs';
import { Splash } from '~/components/Splash';
import { AccountValue } from './AccountValue';
import { Address } from 'lib';
import { NotFound } from '~/components/NotFound';
import { gql } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import { HomeQuery, HomeQueryVariables } from '@api/gen/graphql';
import { HomeDocument } from '@api/generated';

gql(/* GraphQL */ `
  query Home($account: Address) {
    account(input: { address: $account }) {
      id
      address
      ...HomeAppbar_account
    }

    ...AccountValue_tokensQuery @arguments(account: $account)
  }
`);

export interface HomeScreenParams {
  account?: Address;
}

export type HomeScreenProps = StackNavigatorScreenProps<'Home'>;

export const HomeScreen = withSuspense(({ route }: HomeScreenProps) => {
  const query = useSuspenseQuery<HomeQuery, HomeQueryVariables>(HomeDocument, {
    variables: { account: route.params.account },
  }).data;
  const { account } = query;

  if (!account) return <NotFound name="Account" />;

  return (
    <Screen>
      <HomeAppbar account={account} />

      <AccountValue tokensQuery={query} />

      <QuickActions account={account.address} />

      <Tabs account={account.address} />
    </Screen>
  );
}, Splash);
