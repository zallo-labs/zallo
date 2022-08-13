import { Box } from '@components/Box';
import { SubmittableTextField } from '@components/fields/SubmittableTextField';
import { ScreenSkeleton } from '@components/skeleton/ScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { CheckIcon } from '@util/theme/icons';
import { makeStyles } from '@util/theme/makeStyles';
import { Address, getWalletId, randomWalletRef } from 'lib';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { FAB } from '~/components2/FAB';
import { QuorumCard } from '~/components2/QuorumCard';
import { useSetWalletName } from '~/mutations/wallet/useSetWalletName.api';
import { useUpsertWallet } from '~/mutations/wallet/useUpsertWallet';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { WalletId, CombinedQuorum, CombinedWallet } from '~/queries/wallets';
import { useWallet } from '~/queries/wallets/useWallet';
import { WalletAppbar } from './WalletAppbar';

export interface WalletScreenParams {
  account: Address;
  id?: WalletId;
}

export type WalletScreenProps = RootNavigatorScreenProps<'Wallet'>;

export const WalletScreen = withSkeleton(
  ({ route, navigation: { navigate } }: WalletScreenProps) => {
    const { account, id } = route.params;
    const styles = useStyles();
    const existing = useWallet(id);
    const { AppbarHeader, handleScroll } = useAppbarHeader();
    const setName = useSetWalletName();

    const wallet: CombinedWallet = useMemo(() => {
      if (existing) return existing;

      const ref = randomWalletRef();
      return {
        id: getWalletId(account, ref),
        accountAddr: account,
        ref,
        name: '',
        quorums: [],
      };
    }, [account, existing]);
    const upsertWallet = useUpsertWallet(wallet);

    const [quorums, setQuorums] = useState(wallet.quorums);

    const isModified = useMemo(
      () => !_.isEqual(wallet.quorums, quorums),
      [wallet.quorums, quorums],
    );

    const saveName = (name: string) => setName({ ...wallet, name });

    const addQuorum = (quroum: CombinedQuorum) =>
      setQuorums((quorums) => [...quorums, quroum]);

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
        <WalletAppbar
          wallet={wallet}
          AppbarHeader={AppbarHeader}
          addQuorum={addQuorum}
        />

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
          style={styles.list}
          data={quorums}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        />

        {isModified && (
          <FAB
            icon={CheckIcon}
            label="Apply"
            onPress={() => upsertWallet(wallet, existing)}
          />
        )}
      </Box>
    );
  },
  ScreenSkeleton,
);

const useStyles = makeStyles(({ space }) => ({
  list: {
    marginHorizontal: space(3),
  },
}));
