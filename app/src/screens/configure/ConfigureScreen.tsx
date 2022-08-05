import { Box } from '@components/Box';
import { ScreenSkeleton } from '@components/skeleton/ScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { CheckIcon } from '@util/theme/icons';
import { useTheme } from '@util/theme/paper';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { FAB } from '~/components2/FAB';
import { useSetAccountName } from '~/mutations/account/useSetAccountName.api';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { AccountId, CombinedQuorum } from '~/queries/accounts';
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

    const [quorums, setQuorums] = useState(account.quorums);

    const isModified = useMemo(
      () => !_.isEqual(account.quorums, quorums),
      [account.quorums, quorums],
    );

    const saveName = (name: string) => setName({ ...account, name });

    const handleQuorumChange =
      (quorum: CombinedQuorum) => (newQuorum?: CombinedQuorum) =>
        setQuorums((quorums) => {
          const withoutOld = quorums.filter((q) => q !== quorum);

          return newQuorum ? [...withoutOld, newQuorum] : withoutOld;
        });

    return (
      <Box flex={1}>
        <ConfigureAppbar account={account} AppbarHeader={AppbarHeader} />

        <FlatList
          ListHeaderComponent={
            <>
              <AccountNameInput value={account.name} onSave={saveName} />

              <Box my={3}>
                <Text variant="titleMedium">Quorums</Text>
              </Box>
            </>
          }
          renderItem={({ item: quorum }) => (
            <QuorumCard
              quorum={quorum}
              onPress={() =>
                navigate('Quorum', {
                  quorum,
                  onChange: handleQuorumChange(quorum),
                })
              }
            />
          )}
          ItemSeparatorComponent={() => <Box my={2} />}
          style={{ marginHorizontal: space(3) }}
          data={quorums}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        />

        {isModified && (
          <FAB
            icon={CheckIcon}
            label="Apply"
            onPress={() => {
              // TODO: implement propose
            }}
          />
        )}
      </Box>
    );
  },
  ScreenSkeleton,
);
