import { StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Decimal from 'decimal.js';
import { Text } from 'react-native-paper';

import { asChain } from 'lib';
import { AccountParams } from '~/app/(drawer)/[account]/(home)/_layout';
import { ListItemHeight } from '~/components/list/ListItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { TokenItem } from '~/components/token/TokenItem';
import { usePollQuery, useQuery } from '~/gql';
import { gql } from '~/gql/api/generated';
import { useLocalParams } from '~/hooks/useLocalParams';

const Query = gql(/* GraphQL */ `
  query TokensTab($account: UAddress!, $chain: Chain) {
    tokens(input: { chain: $chain }) {
      id
      decimals
      price {
        id
        usd
      }
      balance(input: { account: $account })
      ...TokenItem_Token
    }
  }
`);

const TokensTabParams = AccountParams;

function TokensTab() {
  const { account } = useLocalParams(TokensTabParams);
  const { data, reexecute } = useQuery(
    Query,
    { account, chain: asChain(account) },
    { requestPolicy: 'cache-and-network' },
  );
  usePollQuery(reexecute, 15000);

  const tokens = (data.tokens ?? [])
    .map((t) => ({
      ...t,
      value: new Decimal(t.balance).mul(new Decimal(t.price?.usd ?? 0)),
    }))
    .sort((a, b) => b.value.comparedTo(a.value));

  return (
    <FlashList
      data={tokens}
      renderItem={({ item }) => <TokenItem token={item} amount={item.balance} />}
      ListEmptyComponent={
        <Text variant="titleMedium" style={styles.emptyText}>
          You have no tokens{'\n'}
          Receive tokens to get started
        </Text>
      }
      contentContainerStyle={styles.contentContainer}
      estimatedItemSize={ListItemHeight.DOUBLE_LINE}
      getItemType={(item) => item.__typename}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
    />
  );
}

export default withSuspense(
  TokensTab,
  <TabScreenSkeleton listItems={{ leading: true, supporting: true, trailing: true }} />,
);

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 8,
  },
  emptyText: {
    margin: 16,
    textAlign: 'center',
  },
});
