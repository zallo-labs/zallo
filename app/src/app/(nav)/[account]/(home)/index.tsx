import { FirstPane } from '#/layout/FirstPane';
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
import { useLazyLoadQuery } from 'react-relay';
import { HomePaneQuery } from '~/api/__generated__/HomePaneQuery.graphql';

const Query = graphql`
  query HomePaneQuery($account: UAddress!, $chain: Chain!) {
    account(address: $account) {
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

function HomePane_() {
  const { styles } = useStyles(stylesheet);
  const address = useLocalParams(AccountParams).account;
  const chain = asChain(address);
  const { account, user, tokens } = useLazyLoadQuery<HomePaneQuery>(Query, {
    account: address,
    chain,
  });

  const tokensByValue = tokens
    .map((t) => ({
      ...t,
      value: new Decimal(t.balance).mul(new Decimal(t.price?.usd ?? 0)),
    }))
    .sort((a, b) => b.value.comparedTo(a.value));

  if (!account) return null;

  return (
    <FirstPane flex>
      <FlatList
        ListHeaderComponent={
          <>
            <Appbar leading="menu" center headline={<AccountSelector account={account} />} />
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
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={{ overflow: 'visible' }} // Required for some reason
        // style={styles.container} // Doesn't work...
      />
    </FirstPane>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    overflow: 'visible', // Allows negative pane margins
  },
  item: {
    backgroundColor: colors.background,
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

export const HomePane = withSuspense(HomePane_, <PaneSkeleton />);

export default function HomeScreen() {
  return null;
}

export { ErrorBoundary } from '#/ErrorBoundary/ErrorBoundary';
