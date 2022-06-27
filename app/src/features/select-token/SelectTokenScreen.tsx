import { GenericListScreenSkeleton } from '@components/GenericScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { RootNavigatorScreenProps } from '@features/navigation/RootNavigator';
import { NavTarget, navToTarget } from '@features/navigation/target';
import { useCallback, useMemo } from 'react';
import { FlatList } from 'react-native';
import { Token } from '~/token/token';
import { useTokens } from '~/token/useToken';
import { SelectTokenAppbar } from './SelectTokenAppbar';
import { SelectTokenItem } from './SelectTokenItem';

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

    const tokens = useMemo(
      () => [...unsortedTokens].sort((a, b) => a.name.localeCompare(b.name)),
      [unsortedTokens],
    );

    const select = useCallback(
      (token: Token) => navToTarget(navigation, target, token),
      [navigation, target],
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
  GenericListScreenSkeleton,
);
