import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { Box } from '~/components/layout/Box';
import { ListScreenSkeleton } from '~/components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { PlusIcon } from '~/util/theme/icons';
import { FlatList } from 'react-native';
import { AppbarSearch } from '~/components/Appbar/AppbarSearch';
import { FAB } from '~/components/FAB';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { Token } from '@token/token';
import { useTokens } from '@token/useToken';
import { useFuzzySearch } from '@hook/useFuzzySearch';
import { TokenCard } from '~/components/token/TokenCard';

export interface TokensScreenParams {
  onSelect?: (token: Token) => void;
}

export type TokensScreenProps = RootNavigatorScreenProps<'Tokens'>;

export const TokensScreen = withSkeleton(
  ({ navigation, route }: TokensScreenProps) => {
    const { onSelect } = route.params;
    const { AppbarHeader, handleScroll } = useAppbarHeader();
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
            renderItem={({ item }) => (
              <TokenCard
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
            keyExtractor={(item) => item.addr}
            data={tokens}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
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
