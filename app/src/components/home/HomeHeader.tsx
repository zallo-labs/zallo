import { UAddress } from 'lib';
import { NotFound } from '#/NotFound';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { View } from 'react-native';
import { AccountValue } from './AccountValue';
import { HomeAppbar } from './HomeAppbar';
import { QuickActions } from './QuickActions';
import { withSuspense } from '#/skeleton/withSuspense';
import { GettingStarted } from '#/home/GettingStarted';
import { createStyles } from '@theme/styles';

const Query = gql(/* GraphQL */ `
  query HomeHeader($account: UAddress!) {
    account(input: { account: $account }) {
      id
      address
      ...HomeAppbar_account
    }

    ...AccountValue_Query @arguments(account: $account)
  }
`);

export interface HomeHeaderProps {
  account: UAddress;
}

function Header(props: HomeHeaderProps) {
  const { data: query, stale } = useQuery(Query, { account: props.account });
  const { account } = query;

  if (!account) return stale ? null : <NotFound name="Account" />;

  return (
    <View>
      <HomeAppbar account={account} />

      <AccountValue query={query} />

      <QuickActions account={account.address} />

      <GettingStarted account={account.address} style={styles.gettingStarted} />
    </View>
  );
}

const styles = createStyles({
  gettingStarted: {
    marginBottom: 8,
  },
});

export const HomeHeader = withSuspense(Header);
