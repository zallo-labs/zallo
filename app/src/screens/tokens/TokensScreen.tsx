import { StyleSheet } from 'react-native';
import { Address } from 'lib';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Searchbar } from '~/components/fields/Searchbar';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { AddIcon, SearchIcon } from '@theme/icons';
import { ListHeader } from '~/components/list/ListHeader';
import { TokenItem } from '~/components/token/TokenItem';
import { Screen } from '~/components/layout/Screen';
import { EventEmitter } from '~/util/EventEmitter';
import { useState } from 'react';
import { gql } from '@api/generated';
import { FlashList } from '@shopify/flash-list';
import { ListItemHeight } from '~/components/list/ListItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { useQuery } from '~/gql';

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

const TOKEN_EMITTER = new EventEmitter<Address>('Token');
export const useSelectToken = TOKEN_EMITTER.createUseSelect('TokensModal');

export interface TokensScreenParams {
  account: Address;
  disabled?: Address[];
  enabled?: Address[];
  feeToken?: boolean;
}

export type TokensScreenProps =
  | StackNavigatorScreenProps<'Tokens'>
  | StackNavigatorScreenProps<'TokensModal'>;

export const TokensScreen = withSuspense(
  ({ route, navigation: { navigate } }: TokensScreenProps) => {
    const disabled = new Set(route.params.disabled);
    const enabled = route.params.enabled && new Set(route.params.enabled);

    const [query, setQuery] = useState('');

    const { tokens } = useQuery(Query, {
      account: route.params.account,
      query,
      feeToken: route.params.feeToken,
    }).data;

    const onSelect = (token: Address) => () =>
      route.name === 'TokensModal' ? TOKEN_EMITTER.emit(token) : navigate('Token', { token });

    return (
      <Screen>
        <Searchbar
          leading={AppbarBack2}
          placeholder="Search tokens"
          trailing={[
            SearchIcon,
            (props) => <AddIcon {...props} onPress={() => navigate('Token', {})} />,
          ]}
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
              onPress={onSelect(token.address)}
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
  },
  ScreenSkeleton,
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
});
