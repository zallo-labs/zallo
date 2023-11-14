import { Address } from 'lib';
import { NotFound } from '~/components/NotFound';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { View } from 'react-native';
import { AccountValue } from './AccountValue';
import { HomeAppbar } from './HomeAppbar';
import { QuickActions } from './QuickActions';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { GettingStarted } from '~/components/home/GettingStarted';
import { createStyles } from '@theme/styles';

const Query = gql(/* GraphQL */ `
  query HomeHeader($account: Address!) {
    account(input: { address: $account }) {
      id
      address
      ...HomeAppbar_account
      ...GettingStarted_Account
    }

    user {
      id
      ...GettingStarted_User
    }

    ...AccountValue_Query @arguments(account: $account)
    ...GettingStarted_Query @arguments(account: $account)
  }
`);

export interface HomeHeaderProps {
  account: Address;
}

function Header(props: HomeHeaderProps) {
  const { data: query, stale } = useQuery(Query, { account: props.account });
  const { account, user } = query;

  if (!account) return stale ? null : <NotFound name="Account" />;

  return (
    <View>
      <HomeAppbar account={account} />

      <AccountValue query={query} />

      <QuickActions account={account.address} />

      <GettingStarted query={query} user={user} account={account} style={styles.gettingStarted} />
    </View>
  );
}

const styles = createStyles({
  gettingStarted: {
    marginBottom: 8,
  },
});

export const HomeHeader = withSuspense(Header);
