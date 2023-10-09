import { SearchParams, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Address } from 'lib';
import { Searchbar } from '~/components/fields/Searchbar';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
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

const Query = gql(/* GraphQL */ `
  query TokensScreen($account: Address!, $query: String, $feeToken: Boolean) {
    tokens(input: { query: $query, feeToken: $feeToken }) {
      id
      address
      balance(input: { account: $account })
      ...TokenItem_token
    }
  }
`);

const TOKEN_SELECTED = new Subject<Address>();
export const useSelectToken = () => {
  const getEvent = useGetEvent();

  return (params: TokensScreenParams) => {
    return getEvent({ pathname: `/[account]/tokens`, params }, TOKEN_SELECTED);
  };
};

export type TokensScreenRoute = `/[account]/tokens`;
export type TokensScreenParams = SearchParams<TokensScreenRoute> & {
  account: Address;
  disabled?: Address[];
  enabled?: Address[];
  feeToken?: 'true';
  modal?: 'true';
};

const queryContext: Partial<OperationContext> = { suspense: false };

export default function TokensScreen() {
  const params = useLocalSearchParams<TokensScreenParams>();
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
        feeToken: params.feeToken === 'true',
      },
      queryContext,
    ).data.tokens ?? [];

  return (
    <View style={styles.root}>
      {params.modal === 'true' && <Stack.Screen options={{ presentation: 'modal' }} />}

      <Searchbar
        leading={AppbarBack2}
        placeholder="Search tokens"
        trailing={[
          SearchIcon,
          (props) => <AddIcon {...props} onPress={() => router.push(`/token/add`)} />,
        ]}
        value={query}
        onChangeText={setQuery}
      />

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
                router.push({ pathname: `/token/[token]`, params: { token: token.address } });
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    paddingVertical: 8,
  },
});
