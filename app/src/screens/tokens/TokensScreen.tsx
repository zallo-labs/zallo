import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { ListScreenSkeleton } from '@components/ListScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { PlusIcon } from '@util/theme/icons';
import { FlatList } from 'react-native';
import { AppbarSearch } from '~/components2/Appbar/AppbarSearch';
import { useFuzzySearch } from '~/components2/Appbar/useFuzzySearch';
import { FAB } from '~/components2/FAB';
import { TokenBalanceCard } from '~/components2/token/TokenBalanceCard';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { Token } from '~/token/token';
import { useTokens } from '~/token/useToken';

export interface TokensScreenParams {
  onSelect?: (token: Token) => void;
}

export type TokensScreenProps = RootNavigatorScreenProps<'Tokens'>;

export const TokensScreen = withSkeleton(
  ({ navigation, route }: TokensScreenProps) => {
    const { onSelect } = route.params;
    const { AppbarHeader, scrollHandler } = useAppbarHeader();
    const [tokens, searchProps] = useFuzzySearch(useTokens(), [
      'name',
      'symbol',
    ]);

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
            data={tokens}
            renderItem={({ item }) => (
              <TokenBalanceCard
                token={item}
                {...(onSelect && {
                  onPress: () => {
                    onSelect(item);
                    navigation.goBack();
                  },
                })}
              />
            )}
            ItemSeparatorComponent={() => <Box my={2} />}
            showsVerticalScrollIndicator={false}
            onScroll={scrollHandler}
          />
        </Box>

        <FAB
          icon={PlusIcon}
          label="Add"
          onPress={() => alert('Unimplemented')}
        />
      </Box>
    );
  },
  ListScreenSkeleton,
);
