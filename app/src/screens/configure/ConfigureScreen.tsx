import { Box } from '@components/Box';
import { ScreenSkeleton } from '@components/skeleton/ScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { useTheme } from '@util/theme/paper';
import { useCallback } from 'react';
import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { useSetAccountName } from '~/mutations/account/useSetAccountName.api';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { AccountId } from '~/queries/accounts';
import { useAccount } from '~/queries/accounts/useAccount';
import { QuorumCard } from '../../components2/QuorumCard';
import { AccountNameInput } from './AccountNameInput';
import { ConfigureAppbar } from './ConfigureAppbar';

export interface ConfigureScreenParams {
  id: AccountId;
}

export type ConfigureScreenProps = RootNavigatorScreenProps<'Configure'>;

export const ConfigureScreen = withSkeleton(
  ({ route, navigation: { navigate } }: ConfigureScreenProps) => {
    const account = useAccount(route.params.id);
    const { AppbarHeader, handleScroll } = useAppbarHeader();
    const { space } = useTheme();
    const setName = useSetAccountName();

    const handleNameChange = useCallback(
      (name: string) => setName({ ...account, name }),
      [account, setName],
    );

    return (
      <Box>
        <ConfigureAppbar account={account} AppbarHeader={AppbarHeader} />

        <FlatList
          ListHeaderComponent={
            <>
              <AccountNameInput
                value={account.name}
                onSave={handleNameChange}
              />

              <Box my={3}>
                <Text variant="titleMedium">Quorums</Text>
              </Box>
            </>
          }
          renderItem={({ item }) => (
            <QuorumCard quorum={item} onPress={() => navigate('Quorum', {})} />
          )}
          ItemSeparatorComponent={() => <Box my={2} />}
          style={{ marginHorizontal: space(3) }}
          data={account.quorums}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        />
      </Box>
    );
  },
  ScreenSkeleton,
);
