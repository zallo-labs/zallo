import { Address } from 'lib';
import { NotFound } from '~/components/NotFound';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { Suspend } from '~/components/Suspender';
import { View } from 'react-native';
import { AccountValue } from './AccountValue';
import { HomeAppbar } from './HomeAppbar';
import { QuickActions } from './QuickActions';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { Text } from 'react-native-paper';

const Query = gql(/* GraphQL */ `
  query HomeHeader($account: Address) {
    account(input: { address: $account }) {
      id
      address
      ...HomeAppbar_account
    }

    ...AccountValue_tokensQuery @arguments(account: $account)
  }
`);

export interface HomeHeaderProps {
  account: Address;
}

export const HomeHeader = withSuspense(
  (props: HomeHeaderProps) => {
    const query = useQuery(Query, { account: props.account });
    const { account } = query.data;

    // if (!account) return query.stale ? <Suspend /> : <NotFound name="Account" />;
    if (!account) return null;

    return (
      <View>
        <HomeAppbar account={account} />

        <AccountValue tokensQuery={query.data} />

        <QuickActions account={account.address} />
      </View>
    );
  },
  () => <Text>Suspended</Text>,
);
