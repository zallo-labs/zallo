import { Addr } from '@components/Addr';
import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { ListScreenSkeleton } from '@components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { SettingsIcon } from '@util/theme/icons';
import { useTheme } from '@util/theme/paper';
import { FlatList } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { Balance } from '~/components2/Balance';
import { TokenBalanceCard } from '~/components2/token/TokenBalanceCard';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { AccountId } from '~/queries/accounts';
import { useAccount } from '~/queries/accounts/useAccount';
import { useTokens } from '~/token/useToken';

export interface AccountScreenParams {
  id: AccountId;
}

export type AccountScreenProps = RootNavigatorScreenProps<'Account'>;

export const AccountScreen = withSkeleton(
  ({ route, navigation }: AccountScreenProps) => {
    const account = useAccount(route.params.id);
    const { AppbarHeader, handleScroll } = useAppbarHeader();
    const { space } = useTheme();
    const tokens = useTokens();

    return (
      <Box>
        <AppbarHeader>
          <AppbarBack />
          <Appbar.Content title={account.name} />
          <Appbar.Action
            icon={SettingsIcon}
            onPress={() =>
              navigation.navigate('Configure', { id: route.params.id })
            }
          />
        </AppbarHeader>

        <FlatList
          ListHeaderComponent={() => (
            <Box horizontal justifyContent="space-between" m={1}>
              <Text variant="bodyLarge">
                <Addr addr={account.safeAddr} />
              </Text>

              <Text variant="bodyLarge">
                <Balance addr={account.safeAddr} />
              </Text>
            </Box>
          )}
          renderItem={({ item }) => <TokenBalanceCard token={item} my={2} />}
          data={tokens}
          style={{ marginHorizontal: space(3) }}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        />
      </Box>
    );
  },
  ListScreenSkeleton,
);
