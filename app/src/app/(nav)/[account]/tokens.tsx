import { useRouter } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';
import { asChain } from 'lib';
import { AddIcon } from '@theme/icons';
import { ListHeader } from '#/list/ListHeader';
import { TokenItem } from '#/token/TokenItem';
import { useState } from 'react';
import { z } from 'zod';
import { zUAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { SearchbarOptions } from '#/Appbar/SearchbarOptions';
import { ScreenSurface } from '#/layout/ScreenSurface';
import { MenuOrSearchIcon } from '#/Appbar/MenuOrSearchIcon';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { tokens_TokensScreenQuery } from '~/api/__generated__/tokens_TokensScreenQuery.graphql';

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

const TokensScreenParams = z.object({ account: zUAddress() });

function TokensScreen() {
  const { account } = useLocalParams(TokensScreenParams);
  const router = useRouter();

  const [query, setQuery] = useState('');

  const tokens = useLazyLoadQuery<tokens_TokensScreenQuery>(Query, {
    account,
    chain: asChain(account),
    query,
  }).tokens;

  return (
    <>
      <SearchbarOptions
        leading={MenuOrSearchIcon}
        placeholder="Search tokens"
        trailing={(props) => <AddIcon {...props} onPress={() => router.push(`/token/add`)} />}
        value={query}
        onChangeText={setQuery}
      />

      <ScreenSurface>
        <FlatList
          data={tokens}
          ListHeaderComponent={<ListHeader>Tokens</ListHeader>}
          renderItem={({ item: token }) => (
            <TokenItem
              token={token}
              amount={token.balance}
              onPress={() =>
                router.push({
                  pathname: `/(nav)/token/[token]`,
                  params: { token: token.address },
                })
              }
            />
          )}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
        />
      </ScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
});

export default withSuspense(TokensScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
