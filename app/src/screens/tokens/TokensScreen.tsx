import { FlatList } from 'react-native';
import { Token } from '@token/token';
import { useSearch } from '@hook/useSearch';
import { Address } from 'lib';
import { useTokens } from '@token/useToken';
import { makeStyles } from '@theme/makeStyles';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Searchbar } from '~/components/fields/Searchbar';
import { AccountId } from '@api/account';
import { AppbarMenu2 } from '~/components/Appbar/AppbarMenu';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { SearchIcon } from '@theme/icons';
import { ListHeader } from '~/components/list/ListHeader';
import { TokenItem } from '~/components/token/TokenItem';
import { useSelectedAccountId } from '~/components/AccountSelector/useSelectedAccount';
import { Screen } from '~/components/layout/Screen';

export interface TokensScreenParams {
  onSelect?: (token: Token) => void;
  account?: AccountId;
  disabled?: Set<Address>;
}

export type TokensScreenProps =
  | StackNavigatorScreenProps<'Tokens'>
  | StackNavigatorScreenProps<'TokensModal'>;

export const TokensScreen = ({ route }: TokensScreenProps) => {
  const { onSelect, account = useSelectedAccountId(), disabled } = route.params;
  const styles = useStyles();
  const isScreen = route.name == 'Tokens';

  const [tokens, searchProps] = useSearch(useTokens(), ['name', 'symbol', 'addr']);

  return (
    <Screen safeArea={isScreen ? 'withoutTop' : 'withoutVertical'} style={styles.root}>
      <Searchbar
        leading={isScreen ? AppbarMenu2 : AppbarBack2}
        placeholder="Search tokens"
        trailing={SearchIcon}
        {...searchProps}
      />

      <FlatList
        data={tokens}
        ListHeaderComponent={<ListHeader>Tokens</ListHeader>}
        renderItem={({ item: token }) => (
          <TokenItem
            token={token}
            account={account}
            onPress={onSelect ? () => onSelect(token) : undefined}
            disabled={disabled?.has(token.addr)}
          />
        )}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};

const useStyles = makeStyles(({ s }) => ({
  root: {
    marginTop: s(16),
  },
  container: {
    paddingVertical: s(8),
  },
}));
