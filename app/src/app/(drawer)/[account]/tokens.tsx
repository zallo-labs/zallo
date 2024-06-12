import { useRouter } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';
import { asChain } from 'lib';
import { AddIcon, SearchIcon } from '@theme/icons';
import { ListHeader } from '#/list/ListHeader';
import { TokenItem } from '#/token/TokenItem';
import { useState } from 'react';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { OperationContext } from 'urql';
import { AppbarMenu } from '#/Appbar/AppbarMenu';
import { z } from 'zod';
import { zUAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { SearchbarOptions } from '#/Appbar/SearchbarOptions';
import { ScreenSurface } from '#/layout/ScreenSurface';

const Query = gql(/* GraphQL */ `
  query TokensScreen($account: UAddress!, $chain: Chain, $query: String) {
    tokens(input: { chain: $chain, query: $query }) {
      id
      address
      balance(input: { account: $account })
      ...TokenItem_Token
    }
  }
`);

const TokensScreenParams = z.object({ account: zUAddress() });

const noSuspense: Partial<OperationContext> = { suspense: false };

function TokensScreen() {
  const { account } = useLocalParams(TokensScreenParams);
  const router = useRouter();

  const [query, setQuery] = useState('');

  const tokens =
    useQuery(Query, { account, chain: asChain(account), query }, noSuspense).data.tokens ?? [];

  return (
    <>
      <SearchbarOptions
        leading={(props) => <AppbarMenu fallback={SearchIcon} {...props} />}
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
                  pathname: `/(drawer)/token/[token]`,
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
