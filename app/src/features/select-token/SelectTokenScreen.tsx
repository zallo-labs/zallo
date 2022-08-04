import { ListScreenSkeleton } from '@components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { RootNavigatorScreenProps } from '@features/navigation/RootNavigator';
import { NavTarget, navToTarget } from '@features/navigation/target';
import { useCallback, useMemo } from 'react';
import { FlatList } from 'react-native';
import { Token } from '~/token/token';
import { useTokens } from '~/token/useToken';
import { SelectTokenAppbar } from './SelectTokenAppbar';
import { SelectTokenItem } from './SelectTokenItem';
import { useSetLastToken } from './useLastToken';

export interface SelectTokenScreenParams {
  target: NavTarget;
}

export type SelectTokenScreenProps = RootNavigatorScreenProps<'SelectToken'>;

export const SelectTokenScreen = withSkeleton(
  ({
    navigation,
    route: {
      params: { target },
    },
  }: SelectTokenScreenProps) => {
    const unsortedTokens = useTokens();
    const setLastToken = useSetLastToken();

    const tokens = useMemo(
      () => [...unsortedTokens].sort((a, b) => a.name.localeCompare(b.name)),
      [unsortedTokens],
    );

    const select = useCallback(
      (token: Token) => {
        setLastToken(token.addr);
        navToTarget(navigation, target, token);
      },
      [navigation, setLastToken, target],
    );

    return (
      <FlatList
        ListHeaderComponent={SelectTokenAppbar}
        data={tokens}
        renderItem={({ item }) => (
          <SelectTokenItem
            token={item}
            my={2}
            mx={3}
            onPress={() => select(item)}
          />
        )}
      />
    );
  },
  ListScreenSkeleton,
);
