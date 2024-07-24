import { PaneSkeleton } from '#/skeleton/PaneSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { useLocalParams } from '~/hooks/useLocalParams';
import { AccountParams } from '../_layout';
import { asChain } from 'lib';
import { QuickActions } from '#/home/QuickActions';
import { Appbar } from '#/Appbar/Appbar';
import { AccountSelector } from '#/AccountSelector';
import { ActivitySection } from '#/home/ActivitySection';
import { AccountValue } from '#/home/AccountValue';
import Decimal from 'decimal.js';
import { TokenItem } from '#/token/TokenItem';
import { createStyles, useStyles } from '@theme/styles';
import { FlatList, View } from 'react-native';
import { CORNER } from '@theme/paper';
import { ITEM_LIST_GAP } from '#/layout/ItemList';
import { graphql } from 'relay-runtime';
import { HomePaneQuery } from '~/api/__generated__/HomePaneQuery.graphql';
import { useLazyQuery } from '~/api/useLazyQuery';
import { Pane } from '#/layout/Pane';
import { PaneOptions } from '#/Appbar/PaneOptions';

const Query = graphql`
  query HomePaneQuery($account: UAddress!, $chain: Chain!) {
    account(address: $account) @required(action: THROW) {
      id
      ...AccountSelector_account
      ...ActivitySection_account
    }

    user {
      id
      ...ActivitySection_user
    }

    tokens(input: { chain: $chain }) {
      id
      balance(input: { account: $account })
      price {
        id
        usd
      }
      ...AccountValue_token @arguments(account: $account)
      ...TokenItem_token
    }
  }
`;

function HomePane() {
  const { styles } = useStyles(stylesheet);
  const address = useLocalParams(AccountParams).account;
  const chain = asChain(address);
  const { account, user, tokens } = useLazyQuery<HomePaneQuery>(Query, {
    account: address,
    chain,
  });

  const tokensByValue = tokens
    .map((t) => ({
      ...t,
      value: new Decimal(t.balance).mul(new Decimal(t.price?.usd ?? 0)),
    }))
    .sort((a, b) => b.value.comparedTo(a.value));

  return (
    <Pane flex padding={false}>
      <Appbar
        leading="menu"
        center
        headline={<AccountSelector account={account} />}
        style={styles.appbar}
      />
      <FlatList
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <>
            <QuickActions account={address} />
            <ActivitySection account={account} user={user} />
            <AccountValue tokens={tokens} />
          </>
        }
        data={tokensByValue}
        renderItem={({ item, index }) => (
          <TokenItem
            token={item}
            amount={item.balance}
            containerStyle={[
              styles.item,
              index === 0 && styles.firstItem,
              index === tokensByValue.length - 1 && styles.lastItem,
            ]}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </Pane>
  );
}

const stylesheet = createStyles(({ colors, padding }) => ({
  container: {
    paddingHorizontal: padding,
    paddingBottom: 16,
  },
  appbar: {
    marginRight: 40, // menu offset
  },
  item: {
    backgroundColor: colors.surface,
  },
  separator: {
    height: ITEM_LIST_GAP,
  },
  firstItem: {
    borderTopLeftRadius: CORNER.l,
    borderTopRightRadius: CORNER.l,
  },
  lastItem: {
    borderBottomLeftRadius: CORNER.l,
    borderBottomRightRadius: CORNER.l,
  },
}));

export default withSuspense(HomePane, <PaneSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary/ErrorBoundary';
