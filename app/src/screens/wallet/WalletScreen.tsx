import { Box } from '~/components/layout/Box';
import { TextField } from '~/components/fields/TextField';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { CheckIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { Address, getWalletId, randomWalletRef } from 'lib';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { FAB } from '~/components/FAB';
import { useSetWalletName } from '~/mutations/wallet/useSetWalletName.api';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { WalletId, CombinedWallet } from '~/queries/wallets';
import { useWallet } from '~/queries/wallet/useWallet';
import {
  AlertModalScreenParams,
  useAlertConfirmation,
} from '../alert/AlertModalScreen';
import { WalletAppbar } from './WalletAppbar';
import { useUpsertWallet } from '~/mutations/wallet/upsert/useUpsertWallet';
import { QuorumsSection } from './QuorumsSection';
import { SpendingSection } from './SpendingSection';

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
    state: { status: 'add' },
    limits: {
      allowlisted: { proposed: false },
      tokens: {},
    },
  };
};

const isWalletEqual = (a: CombinedWallet, b: CombinedWallet) => {
  const keys: (keyof CombinedWallet)[] = ['quorums', 'limits'];
  return _.isEqual(_.pick(a, keys), _.pick(b, keys));
};

export interface WalletScreenParams {
  account: Address;
  id?: WalletId;
}

export type WalletScreenProps = RootNavigatorScreenProps<'Wallet'>;

export const WalletScreen = withSkeleton(({ route }: WalletScreenProps) => {
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
  const [upsertWallet, applying] = useUpsertWallet(wallet.accountAddr);

  console.log(JSON.stringify(wallet, null, 2));

  return (
    <Box flex={1}>
      <WalletAppbar
        wallet={wallet}
        AppbarHeader={AppbarHeader}
        existing={!!existing}
      />

      <ScrollView style={styles.sections} onScroll={handleScroll}>
        <TextField
          label="Name"
          defaultValue={wallet.name}
          onChangeText={(name) => setWallet((w) => ({ ...w, name }))}
          onSubmitEditing={() => setWalletName(wallet)}
          onBlur={() => setWalletName(wallet)}
          autoFocus={!wallet.name}
          disabled={applying}
        />

        <SpendingSection
          wallet={wallet}
          limits={wallet.limits}
          setLimits={(f) => setWallet((w) => ({ ...w, limits: f(w.limits) }))}
          style={styles.section}
        />

        <QuorumsSection
          initialQuorums={initialWallet.quorums}
          quorums={wallet.quorums}
          setQuorums={(f) =>
            setWallet((w) => ({ ...w, quorums: f(w.quorums) }))
          }
          style={styles.section}
        />
      </ScrollView>

      {upsertWallet && !isWalletEqual(initialWallet, wallet) && (
        <FAB
          icon={CheckIcon}
          label="Apply"
          loading={applying}
          onPress={async () => {
            const apply = () => upsertWallet(wallet);

            if (initialWallet.state.proposedModification) {
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
}, ScreenSkeleton);

const useStyles = makeStyles(({ space }) => ({
  sections: {
    marginHorizontal: space(3),
  },
  section: {
    marginTop: space(3),
  },
  endButton: {
    alignSelf: 'flex-end',
    marginTop: space(2),
  },
}));
