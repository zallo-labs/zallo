import { Address } from 'lib';
import { NotFound } from '~/components/NotFound';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { View } from 'react-native';
import { AccountValue } from './AccountValue';
import { HomeAppbar } from './HomeAppbar';
import { QuickActions } from './QuickActions';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { Suspend } from '~/components/Suspend';

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

function Header(props: HomeHeaderProps) {
  const query = useQuery(Query, { account: props.account });
  const { account } = query.data;

  if (!account) return query.stale ? <Suspend /> : <NotFound name="Account" />;

  return (
    <View>
      <HomeAppbar account={account} />

      <AccountValue tokensQuery={query.data} />

      <QuickActions account={account.address} />
    </View>
  );
}

export const HomeHeader = withSuspense(Header);
