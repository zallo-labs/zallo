import { StyleSheet } from 'react-native';
import { Address } from 'lib';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Searchbar } from '~/components/fields/Searchbar';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { SearchIcon } from '@theme/icons';
import { ListHeader } from '~/components/list/ListHeader';
import { TokenItem } from '~/components/token/TokenItem';
import { Screen } from '~/components/layout/Screen';
import { EventEmitter } from '~/util/EventEmitter';
import { useState } from 'react';
import { gql } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import { TokensScreenQuery, TokensScreenQueryVariables } from '@api/gen/graphql';
import { TokensScreenDocument } from '@api/generated';
import { FlashList } from '@shopify/flash-list';
import { ListItemHeight } from '~/components/list/ListItem';

gql(/* GraphQL */ `
  query TokensScreen($account: Address!, $query: String) {
    tokens(input: { query: $query }) {
      id
      address
      balance(input: { account: $account })
      ...TokenItem_token
    }
  }
`);

const TOKEN_EMITTER = new EventEmitter<Address>('Token');
export const useSelectToken = TOKEN_EMITTER.createUseSelect('TokensModal');

export interface TokensScreenParams {
  account: Address;
  disabled?: Address[];
  enabled?: Address[];
}

export type TokensScreenProps =
  | StackNavigatorScreenProps<'Tokens'>
  | StackNavigatorScreenProps<'TokensModal'>;

export const TokensScreen = ({ route }: TokensScreenProps) => {
  const disabled = new Set(route.params.disabled);
  const enabled = route.params.enabled && new Set(route.params.enabled);

  const [query, setQuery] = useState('');

  const { tokens } = useSuspenseQuery<TokensScreenQuery, TokensScreenQueryVariables>(
    TokensScreenDocument,
    { variables: { account: route.params.account, query } },
  ).data;

  const getOnSelect = TOKEN_EMITTER.listeners.size
    ? (token: Address) => () => TOKEN_EMITTER.emit(token)
    : undefined;

  return (
    <Screen>
      <Searchbar
        leading={AppbarBack2}
        placeholder="Search tokens"
        trailing={SearchIcon}
        inset={route.name === 'Tokens'}
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
            onPress={getOnSelect?.(token.address)}
            disabled={disabled?.has(token.address) || (enabled && !enabled.has(token.address))}
          />
        )}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        keyExtractor={(item) => item.id}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
});
