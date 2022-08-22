import { Box } from '@components/Box';
import { TextField } from '@components/fields/TextField';
import { ScreenSkeleton } from '@components/skeleton/ScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { CheckIcon, PlusIcon } from '@util/theme/icons';
import { makeStyles } from '@util/theme/makeStyles';
import assert from 'assert';
import produce from 'immer';
import {
  Address,
  getWalletId,
  hashQuorum,
  randomWalletRef,
  toQuorum,
} from 'lib';
import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { useGoBack } from '~/components2/Appbar/useGoBack';
import { FAB } from '~/components2/FAB';
import { QuorumCard } from '~/components2/QuorumCard';
import { useSetWalletName } from '~/mutations/wallet/useSetWalletName.api';
import { useUpsertWallet } from '~/mutations/wallet/useUpsertWallet';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import {
  WalletId,
  CombinedQuorum,
  CombinedWallet,
  sortCombinedQuorums,
} from '~/queries/wallets';
import { useWallet } from '~/queries/wallets/useWallet';
import { WalletAppbar } from './WalletAppbar';

/*
 *          Actions
| State | ⎌  | + | - |
|:-----:|:--:|:-:|:-:|
|   x   |    | + |   |
|   ✓   | ✓ |   | - |
|   +   | +  |   | x |
|   -   | -  | ✓ |   |
*/

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
    const setWalletName = useSetWalletName();

    const initialWallet = useMemo((): CombinedWallet => {
      if (existing) return existing;

      const ref = randomWalletRef();
      return {
        id: getWalletId(account, ref),
        accountAddr: account,
        ref,
        name: '',
        quorums: [],
        state: 'added',
      };
    }, [account, existing]);
    const [wallet, setWallet] = useState(initialWallet);

    const upsertWallet = useUpsertWallet(wallet);
    const [upserting, setUpserting] = useState(false);

    const isModified = useMemo(
      () => !_.isEqual(initialWallet.quorums, wallet.quorums),
      [initialWallet.quorums, wallet.quorums],
    );

    const makeRemoveQuorum = useCallback((quorum: CombinedQuorum) => {
      if (quorum.state === 'removed') return undefined;

      return () =>
        setWallet((wallet) =>
          produce(wallet, (wallet) => {
            const i = wallet.quorums.findIndex(
              (q) => hashQuorum(q.approvers) === hashQuorum(quorum.approvers),
            );

            if (quorum.state === 'active') {
              wallet.quorums[i].state = 'removed';
            } else {
              assert(quorum.state === 'added');
              wallet.quorums.splice(i, 1);
            }
          }),
        );
    }, []);

    const addQuorum = useCallback((approvers: Address[]) => {
      setWallet((wallet) =>
        produce(wallet, (wallet) => {
          wallet.quorums = sortCombinedQuorums([
            ...wallet.quorums,
            {
              approvers: toQuorum(approvers),
              state: 'added',
            },
          ]);
        }),
      );
    }, []);

    const makeSetQuorumApprovers = useCallback(
      (quorum: CombinedQuorum) => (approvers: Address[]) => {
        makeRemoveQuorum(quorum)?.();
        addQuorum(approvers);
      },
      [addQuorum, makeRemoveQuorum],
    );

    const makeRevertQuorum = useCallback(
      (quorum: CombinedQuorum) => {
        // Revert quorum to initial state if it pre-existed
        const initialIndex = initialWallet.quorums.findIndex(
          (q) => hashQuorum(q.approvers) === hashQuorum(quorum.approvers),
        );

        // Quorum can't be reverted if there is no initial state, or it hasn't changed
        const initial = initialWallet.quorums[initialIndex];
        if (!initial || initial === quorum) return undefined;

        return () => {
          const i = wallet.quorums.findIndex(
            (q) => hashQuorum(q.approvers) === hashQuorum(quorum.approvers),
          );
          assert(i >= 0);

          setWallet((wallet) =>
            produce(wallet, (wallet) => {
              wallet.quorums[i] = initial;
            }),
          );
        };
      },
      [initialWallet.quorums, wallet.quorums],
    );

    return (
      <Box flex={1}>
        <WalletAppbar
          wallet={wallet}
          AppbarHeader={AppbarHeader}
          existing={!!existing}
        />

        <FlatList
          ListHeaderComponent={
            <>
              <TextField
                label="Name"
                defaultValue={wallet.name}
                onSubmitEditing={(event) =>
                  setWalletName({ ...wallet, name: event.nativeEvent.text })
                }
                autoFocus={!wallet.name}
              />

              <Box my={3}>
                <Text variant="titleSmall">Quorums</Text>
              </Box>
            </>
          }
          renderItem={({ item: quorum }) => (
            <QuorumCard
              quorum={quorum}
              onPress={() => {
                navigate('Quorum', {
                  approvers: quorum.approvers,
                  onChange: makeSetQuorumApprovers(quorum),
                  revertQuorum: makeRevertQuorum(quorum),
                  removeQuorum:
                    quorum.state !== 'removed'
                      ? makeRemoveQuorum(quorum)
                      : undefined,
                });
              }}
            />
          )}
          ItemSeparatorComponent={() => <Box my={2} />}
          ListFooterComponent={
            <Button
              icon={PlusIcon}
              style={styles.addQuorum}
              onPress={() => navigate('Quorum', { onChange: addQuorum })}
            >
              Quorum
            </Button>
          }
          style={styles.list}
          data={wallet.quorums}
          extraData={[
            makeSetQuorumApprovers,
            makeRemoveQuorum,
            makeRevertQuorum,
          ]}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        />

        {isModified && upsertWallet && (
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
