import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { Box } from '~/components/layout/Box';
import { ListScreenSkeleton } from '~/components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { FlatList } from 'react-native';
import { AppbarSearch } from '~/components/Appbar/AppbarSearch';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { Token } from '@token/token';
import { useFuzzySearch } from '@hook/useFuzzySearch';
import { TokenCard } from '~/components/token/TokenCard';
import { WalletId } from '~/queries/wallets';
import { TokenAvailableCard } from '~/components/token/TokenAvailableCard';
import { Address } from 'lib';
import { useTokens } from '@token/useTokens';

export interface TokensScreenParams {
  onSelect?: (token: Token) => void;
  wallet?: WalletId;
  disabled?: Address[];
}

export type TokensScreenProps = RootNavigatorScreenProps<'Tokens'>;

export const TokensScreen = withSkeleton(({ route }: TokensScreenProps) => {
  const { onSelect, wallet, disabled = [] } = route.params;
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const [tokens, searchProps] = useFuzzySearch(useTokens(), ['name', 'symbol']);

  return (
    <Box flex={1}>
      <AppbarHeader>
        <AppbarBack />
        <AppbarSearch
          title={onSelect ? 'Select Token' : 'Tokens'}
          {...searchProps}
        />
      </AppbarHeader>
      <Box mx={3}>
        <FlatList
          renderItem={({ item }) => {
            const onPress = onSelect ? () => onSelect(item) : undefined;
            const isDisabled = !!disabled.find((t) => t === item.addr);

            return wallet ? (
              <TokenAvailableCard
                token={item}
                wallet={wallet}
                onPress={onPress}
                disabled={isDisabled}
              />
            ) : (
              <TokenCard token={item} onPress={onPress} disabled={isDisabled} />
            );
          }}
          ItemSeparatorComponent={() => <Box my={2} />}
          keyExtractor={(item) => item.addr}
          data={tokens}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
        />
      </Box>

      {/* TODO: implement user adding tokens */}
      {/* <FAB icon={PlusIcon} label="Add" onPress={() => {}} /> */}
    </Box>
  );
}, ListScreenSkeleton);
