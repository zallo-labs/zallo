import { Box } from '@components/Box';
import { SubmittableTextField } from '@components/fields/SubmittableTextField';
import { ScreenSkeleton } from '@components/skeleton/ScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { CheckIcon, PlusIcon } from '@util/theme/icons';
import { makeStyles } from '@util/theme/makeStyles';
import { Address, getWalletId, randomWalletRef } from 'lib';
import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { Button, Text } from 'react-native-paper';
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

    const initialWallet: CombinedWallet = useMemo(() => {
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
    const [wallet, setWallet] = useState(initialWallet);

    const upsertWallet = useUpsertWallet(wallet);
    const [upserting, setUpserting] = useState(false);

    const isModified = useMemo(
      () => !_.isEqual(initialWallet.quorums, wallet.quorums),
      [initialWallet.quorums, wallet.quorums],
    );

    const saveName = useCallback(
      (name: string) => {
        if (existing) {
          setName({ ...wallet, name });
        } else {
          setWallet((wallet) => ({ ...wallet, name }));
        }
      },
      [existing, setName, wallet],
    );

    const addQuorum = useCallback(
      () =>
        navigate('Quorum', {
          onChange: (quorum) => {
            if (quorum) {
              setWallet((wallet) => ({
                ...wallet,
                quorums: [...wallet.quorums, quorum],
              }));
            }
          },
        }),
      [navigate],
    );

    const configureQuorum = useCallback(
      (quorum: CombinedQuorum) => () =>
        navigate('Quorum', {
          quorum,
          onChange: (newQuorum?: CombinedQuorum) =>
            setWallet((wallet) => {
              const withoutOld = wallet.quorums.filter((q) => q !== quorum);

              return {
                ...wallet,
                quorums: newQuorum ? [...withoutOld, newQuorum] : withoutOld,
              };
            }),
        }),
      [navigate],
    );

    return (
      <Box flex={1}>
        <WalletAppbar
          wallet={wallet}
          AppbarHeader={AppbarHeader}
          existing={!!existing}
        />

        <FlatList
          ListHeaderComponent={() => (
            <>
              <SubmittableTextField
                label="Name"
                value={wallet.name}
                onSubmit={saveName}
                hasError={(v) => !v.length && 'Required'}
                autoFocus={!wallet.name}
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
          ListFooterComponent={
            <Button
              style={styles.addQuorum}
              icon={PlusIcon}
              onPress={addQuorum}
            >
              Add
            </Button>
          }
          style={styles.list}
          data={wallet.quorums}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        />

        {isModified && (
          <FAB
            icon={CheckIcon}
            label="Apply"
            loading={upserting}
            onPress={async () => {
              setUpserting(true);
              await upsertWallet(wallet, existing);
              setUpserting(false);
            }}
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
  addQuorum: {
    alignSelf: 'flex-end',
    marginTop: space(2),
  },
}));
