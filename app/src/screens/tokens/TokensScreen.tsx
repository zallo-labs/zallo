import { FlatList } from 'react-native';
import { Token } from '@token/token';
import { useSearch } from '@hook/useSearch';
import { Address } from 'lib';
import { useTokens } from '@token/useToken';
import { makeStyles } from '@theme/makeStyles';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Searchbar } from '~/components/fields/Searchbar';
import { TokenItem2 } from '~/components/TokenItem2';
import { AccountIdlike } from '@api/account';
import { SafeAreaView } from '~/components/SafeAreaView';
import { AppbarMenu2 } from '~/components/Appbar/AppbarMenu';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { SearchIcon } from '@theme/icons';
import { ListHeader } from '~/components/list/ListHeader';

export interface TokensScreenParams {
  onSelect?: (token: Token) => void;
  account?: AccountIdlike;
  disabled?: Set<Address>;
}

export type TokensScreenProps =
  | StackNavigatorScreenProps<'Tokens'>
  | StackNavigatorScreenProps<'TokensModal'>;

export const TokensScreen = ({ route }: TokensScreenProps) => {
  const { onSelect, account, disabled } = route.params;
  const styles = useStyles();
  const isScreen = route.name == 'Tokens';

  const [tokens, searchProps] = useSearch(useTokens(), ['name', 'symbol', 'addr']);

  return (
    <SafeAreaView enabled={isScreen} style={styles.root}>
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
          <TokenItem2
            token={token}
            account={account}
            onPress={onSelect ? () => onSelect(token) : undefined}
            disabled={disabled?.has(token.addr)}
          />
        )}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
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
