import { Box } from '~/components/layout/Box';
import { TextField } from '~/components/fields/TextField';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { CheckIcon, PlusIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
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
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { FAB } from '~/components/FAB';
import { useSetWalletName } from '~/mutations/wallet/useSetWalletName.api';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import {
  WalletId,
  CombinedQuorum,
  CombinedWallet,
  sortCombinedQuorums,
} from '~/queries/wallets';
import { useWallet } from '~/queries/wallets/useWallet';
import {
  AlertModalScreenParams,
  useAlertConfirmation,
} from '../alert/AlertModalScreen';
import { WalletAppbar } from './WalletAppbar';
import { useUpsertWallet } from '~/mutations/wallet/upsert/useUpsertWallet';
import { QuorumCard } from './QuorumCard';

/*
 *          Actions
| State | ⎌  | + | - |
|:-----:|:--:|:-:|:-:|
|   x   |    | + |   |
|   ✓   | ✓ |   | - |
|   +   | +  |   | x |
|   -   | -  | ✓ |   |
*/

const APPLY_CONFIRMATION: Partial<AlertModalScreenParams> = {
  title: 'Overwrite existing proposal?',
  message: `Are you sure you want to overwrite the existing modification proposal for this wallet?

Approvals for the existing proposal will be lost.`,
};

const newWallet = (account: Address): CombinedWallet => {
  const ref = randomWalletRef();
  return {
    id: getWalletId(account, ref),
    accountAddr: account,
    ref,
    name: '',
    quorums: [],
    state: 'add',
  };
};

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
    const confirm = useAlertConfirmation();

    const initialWallet = useMemo(
      () => existing ?? newWallet(account),
      [account, existing],
    );
    const [wallet, setWallet] = useState(initialWallet);

    const upsertWallet = useUpsertWallet(wallet);
    const [applying, setApplying] = useState(false);

    const isModified = useMemo(
      () => !_.isEqual(initialWallet.quorums, wallet.quorums),
      [initialWallet.quorums, wallet.quorums],
    );

    const makeRemoveQuorum = useCallback((quorum: CombinedQuorum) => {
      if (quorum.state === 'remove') return undefined;

      return () =>
        setWallet((wallet) =>
          produce(wallet, (wallet) => {
            const i = wallet.quorums.findIndex(
              (q) => hashQuorum(q.approvers) === hashQuorum(quorum.approvers),
            );

            if (quorum.state === 'active') {
              wallet.quorums[i].state = 'remove';
            } else {
              assert(quorum.state === 'add');
              wallet.quorums.splice(i, 1);
            }
          }),
        );
    }, []);

    const addQuorum = useCallback((approvers: Address[]) => {
      setWallet((wallet) =>
        produce(wallet, (wallet) => {
          const quorum = toQuorum(approvers);
          const hash = hashQuorum(quorum);

          if (!wallet.quorums.find((q) => hash === hashQuorum(q.approvers))) {
            wallet.quorums = sortCombinedQuorums([
              ...wallet.quorums,
              {
                approvers: toQuorum(approvers),
                state: 'add',
              },
            ]);
          }
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
                onChangeText={(name) =>
                  setWallet((wallet) => ({ ...wallet, name }))
                }
                onSubmitEditing={(event) =>
                  setWalletName({ ...wallet, name: event.nativeEvent.text })
                }
                autoFocus={!wallet.name}
                disabled={applying}
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
                    quorum.state !== 'remove'
                      ? makeRemoveQuorum(quorum)
                      : undefined,
                  state: quorum.state,
                });
              }}
            />
          )}
          ItemSeparatorComponent={() => <Box my={2} />}
          ListFooterComponent={
            <Button
              icon={PlusIcon}
              style={styles.addQuorum}
              onPress={() =>
                navigate('Quorum', { onChange: addQuorum, state: 'add' })
              }
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
            loading={applying}
            onPress={async () => {
              const apply = async () => {
                setApplying(true);
                await upsertWallet(wallet);
                setApplying(false);
              };

              const proposalExists = initialWallet.quorums.some(
                (q) => q.state !== 'active',
              );

              if (proposalExists) {
                confirm({
                  onConfirm: apply,
                  ...APPLY_CONFIRMATION,
                });
              } else {
                apply();
              }
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
