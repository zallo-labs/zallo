import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Address } from 'lib';
import { AddIcon, SearchIcon } from '@theme/icons';
import { ListHeader } from '~/components/list/ListHeader';
import { TokenItem } from '~/components/token/TokenItem';
import { useState } from 'react';
import { gql } from '@api/generated';
import { FlashList } from '@shopify/flash-list';
import { ListItemHeight } from '~/components/list/ListItem';
import { useQuery } from '~/gql';
import { Subject } from 'rxjs';
import { useGetEvent } from '~/hooks/useGetEvent';
import { OperationContext } from 'urql';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { z } from 'zod';
import { zAddress, zArray } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { SearchbarOptions } from '~/components/Appbar/SearchbarOptions';
import { ScreenSurface } from '~/components/layout/ScreenSurface';

const Query = gql(/* GraphQL */ `
  query TokensScreen($account: Address!, $query: String, $feeToken: Boolean) {
    tokens(input: { query: $query, feeToken: $feeToken }) {
      id
      address
      balance(input: { account: $account })
      ...TokenItem_Token
    }
  }
`);

const TOKEN_SELECTED = new Subject<Address>();
export const useSelectToken = () => {
  const getEvent = useGetEvent();

  return (params: TokensScreenParams) => {
    return getEvent(
      { pathname: `/(drawer)/[account]/tokens`, params: params as any },
      TOKEN_SELECTED,
    );
  };
};

export type TokensScreenRoute = `/(drawer)/[account]/tokens`;
export const TokensScreenParams = z.object({
  account: zAddress,
  disabled: zArray(zAddress).optional(),
  enabled: zArray(zAddress).optional(),
  feeToken: z.coerce.boolean().optional(),
});
export type TokensScreenParams = z.infer<typeof TokensScreenParams>;

const queryContext: Partial<OperationContext> = { suspense: false };

function TokensScreen() {
  const params = useLocalParams(`/(drawer)/[account]/tokens`, TokensScreenParams);
  const router = useRouter();
  const disabled = new Set(params.disabled);
  const enabled = params.enabled && new Set(params.enabled);

  const [query, setQuery] = useState('');

  const tokens =
    useQuery(
      Query,
      {
        account: params.account,
        query,
        feeToken: params.feeToken,
      },
      queryContext,
    ).data.tokens ?? [];

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
        <FlashList
          data={tokens}
          ListHeaderComponent={<ListHeader>Tokens</ListHeader>}
          renderItem={({ item: token }) => (
            <TokenItem
              token={token}
              amount={token.balance}
              onPress={() => {
                if (TOKEN_SELECTED.observed) {
                  TOKEN_SELECTED.next(token.address);
                } else {
                  router.push({
                    pathname: `/(drawer)/token/[token]`,
                    params: { token: token.address },
                  });
                }
              }}
              disabled={disabled?.has(token.address) || (enabled && !enabled.has(token.address))}
            />
          )}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={ListItemHeight.DOUBLE_LINE}
          keyExtractor={(item) => item.id}
        />
      </ScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
  },
  container: {
    paddingVertical: 8,
  },
});

export default withSuspense(TokensScreen, ScreenSkeleton);
