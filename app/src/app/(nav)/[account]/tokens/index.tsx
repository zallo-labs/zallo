import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { asChain } from 'lib';
import { AddIcon } from '@theme/icons';
import { TokenItem } from '#/token/TokenItem';
import { useState } from 'react';
import { useLocalParams } from '~/hooks/useLocalParams';
import { withSuspense } from '#/skeleton/withSuspense';
import { MenuOrSearchIcon } from '#/Appbar/MenuOrSearchIcon';
import { graphql } from 'relay-runtime';
import { tokens_TokensScreenQuery } from '~/api/__generated__/tokens_TokensScreenQuery.graphql';
import { useLazyQuery } from '~/api';
import { Searchbar } from '#/Appbar/Searchbar';
import { AccountParams } from '../_layout';
import { Pane } from '#/layout/Pane';
import { ITEM_LIST_GAP } from '#/layout/ItemList';
import { CORNER } from '@theme/paper';
import { PaneSkeleton } from '#/skeleton/PaneSkeleton';

const Query = graphql`
  query tokens_TokensScreenQuery($account: UAddress!, $chain: Chain, $query: String) {
    tokens(input: { chain: $chain, query: $query }) {
      id
      address
      balance(input: { account: $account })
      ...TokenItem_token
    }
  }
`;

const Params = AccountParams;

function TokensScreen() {
  const { account } = useLocalParams(Params);
  const router = useRouter();

  const [query, setQuery] = useState('');

  const { tokens } = useLazyQuery<tokens_TokensScreenQuery>(Query, {
    account,
    chain: asChain(account),
    query: query || null,
  });

  return (
    <Pane flex>
      <Searchbar
        leading={MenuOrSearchIcon}
        placeholder="Search tokens"
        trailing={(props) => (
          <AddIcon
            {...props}
            onPress={() => router.push({ pathname: '/[account]/tokens/add', params: { account } })}
          />
        )}
        value={query}
        onChangeText={setQuery}
      />

      <FlatList
        data={tokens}
        renderItem={({ item: token, index }) => (
          <TokenItem
            variant="surface"
            token={token}
            amount={token.balance}
            containerStyle={[
              index === 0 && styles.firstItem,
              index === tokens.length - 1 && styles.lastItem,
            ]}
            onPress={() =>
              router.push({
                pathname: `/[account]/tokens/[address]`,
                params: { account, address: token.address },
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </Pane>
  );
}

const styles = StyleSheet.create({
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
});

export default withSuspense(TokensScreen, <PaneSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
