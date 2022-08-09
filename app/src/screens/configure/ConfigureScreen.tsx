import { Box } from '@components/Box';
import { SubmittableTextField } from '@components/fields/SubmittableTextField';
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
import { useSetWalletName } from '~/mutations/wallet/useSetWalletName.api';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { WalletId, CombinedQuorum } from '~/queries/wallets';
import { useWallet } from '~/queries/wallets/useWallet';
import { QuorumCard } from '../../components2/QuorumCard';
import { ConfigureAppbar } from './ConfigureAppbar';

export interface ConfigureScreenParams {
  id: WalletId;
}

export type ConfigureScreenProps = RootNavigatorScreenProps<'Configure'>;

export const ConfigureScreen = withSkeleton(
  ({ route, navigation: { navigate } }: ConfigureScreenProps) => {
    const wallet = useWallet(route.params.id);
    const { AppbarHeader, handleScroll } = useAppbarHeader();
    const { space } = useTheme();
    const setName = useSetWalletName();

    const [quorums, setQuorums] = useState(wallet.quorums);

    const isModified = useMemo(
      () => !_.isEqual(wallet.quorums, quorums),
      [wallet.quorums, quorums],
    );

    const saveName = (name: string) => setName({ ...wallet, name });

    const configureQuorum = (quorum: CombinedQuorum) => () =>
      navigate('Quorum', {
        quorum,
        onChange: (newQuorum?: CombinedQuorum) =>
          setQuorums((quorums) => {
            const withoutOld = quorums.filter((q) => q !== quorum);

            return newQuorum ? [...withoutOld, newQuorum] : withoutOld;
          }),
      });

    return (
      <Box flex={1}>
        <ConfigureAppbar wallet={wallet} AppbarHeader={AppbarHeader} />

        <FlatList
          ListHeaderComponent={() => (
            <>
              <SubmittableTextField
                value={wallet.name}
                onSubmit={saveName}
                hasError={(v) => !v.length && 'Required'}
              />

              <Box my={3}>
                <Text variant="titleSmall">Quorums</Text>
              </Box>
            </>
          )}
          renderItem={({ item: quorum }) => (
            <QuorumCard quorum={quorum} onPress={configureQuorum(quorum)} />
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
