import { FlatList, StyleSheet } from 'react-native';
import { Token } from '@token/token';
import { useSearch } from '@hook/useSearch';
import { Address } from 'lib';
import { useTokens } from '@token/useToken';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Searchbar } from '~/components/fields/Searchbar';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { SearchIcon } from '@theme/icons';
import { ListHeader } from '~/components/list/ListHeader';
import { TokenItem } from '~/components/token/TokenItem';
import { useSelectedAccount } from '~/components/AccountSelector/useSelectedAccount';
import { Screen } from '~/components/layout/Screen';
import { EventEmitter } from '~/util/EventEmitter';

const TOKEN_EMITTER = new EventEmitter<Token>('Token');
export const useSelectToken = TOKEN_EMITTER.createUseSelect('TokensModal');

export interface TokensScreenParams {
  account?: Address;
  disabled?: Address[];
}

export type TokensScreenProps =
  | StackNavigatorScreenProps<'Tokens'>
  | StackNavigatorScreenProps<'TokensModal'>;

export const TokensScreen = ({ route }: TokensScreenProps) => {
  const { account = useSelectedAccount() } = route.params;
  const disabled = new Set(route.params.disabled);

  const [tokens, searchProps] = useSearch(useTokens(), ['name', 'symbol', 'address']);

  const getOnSelect = TOKEN_EMITTER.listeners.size
    ? (token: Token) => () => TOKEN_EMITTER.emit(token)
    : undefined;

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
            onPress={getOnSelect?.(token)}
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
