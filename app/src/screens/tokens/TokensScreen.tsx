import { FlatList, StyleSheet } from 'react-native';
import { Token } from '@token/token';
import { useSearch } from '@hook/useSearch';
import { Address } from 'lib';
import { useTokens } from '@token/useToken';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Searchbar } from '~/components/fields/Searchbar';
import { AccountId } from '@api/account';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { SearchIcon } from '@theme/icons';
import { ListHeader } from '~/components/list/ListHeader';
import { TokenItem } from '~/components/token/TokenItem';
import { useSelectedAccountId } from '~/components/AccountSelector/useSelectedAccount';
import { Screen } from '~/components/layout/Screen';

export interface TokensScreenParams {
  account?: AccountId;
  onSelect?: (token: Token) => void;
  disabled?: Set<Address>;
}

export type TokensScreenProps =
  | StackNavigatorScreenProps<'Tokens'>
  | StackNavigatorScreenProps<'TokensModal'>;

export const TokensScreen = ({ route }: TokensScreenProps) => {
  const { account = useSelectedAccountId(), onSelect, disabled } = route.params;

  const [tokens, searchProps] = useSearch(useTokens(), ['name', 'symbol', 'address']);

  return (
    <Screen>
      <Searchbar
        leading={AppbarBack2}
        placeholder="Search tokens"
        trailing={SearchIcon}
        inset={route.name === 'Tokens'}
        {...searchProps}
      />

      <FlatList
        data={tokens}
        ListHeaderComponent={<ListHeader>Tokens</ListHeader>}
        renderItem={({ item: token }) => (
          <TokenItem
            token={token.address}
            account={account}
            onPress={onSelect ? () => onSelect(token) : undefined}
            disabled={disabled?.has(token.address)}
          />
        )}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
});
