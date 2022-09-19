import { Box } from '~/components/layout/Box';
import { TextField } from '~/components/fields/TextField';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { CheckIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { Address, UserId } from 'lib';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { FAB } from '~/components/FAB';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import {
  AlertModalScreenParams,
  useAlertConfirmation,
} from '../alert/AlertModalScreen';
import { CombinedUser } from '~/queries/user/useUser.api';

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
  message: `Are you sure you want to overwrite the existing modification proposal for this user?

Approvals for the existing proposal will be lost.`,
};

const isUserEqual = (a: CombinedUser, b: CombinedUser) =>
  _.isEqual(a.configs.proposed, b.configs.proposed);

export interface UserConfigScreenParams {
  account: Address;
  id?: UserId;
}

export type UserConfigScreenProps = RootNavigatorScreenProps<'UserConfig'>;

export const UserConfigScreen = withSkeleton(
  ({ route }: UserConfigScreenProps) => {
    const { account, id } = route.params;
    // const styles = useStyles();
    // const existing = useWallet(id);
    // const { AppbarHeader, handleScroll } = useAppbarHeader();
    // const setWalletName = useSetWalletName();
    // const confirm = useAlertConfirmation();

    // const initialWallet = useMemo(
    //   () => existing ?? newWallet(account),
    //   [account, existing],
    // );
    // const [wallet, setWallet] = useState(initialWallet);
    // const [upsertWallet, applying] = useUpsertWallet(wallet.accountAddr);

    return null;

    // return (
    //   <Box flex={1}>
    //     <WalletAppbar
    //       wallet={wallet}
    //       AppbarHeader={AppbarHeader}
    //       existing={!!existing}
    //     />

    //     <ScrollView style={styles.sections} onScroll={handleScroll}>
    //       <TextField
    //         label="Name"
    //         defaultValue={wallet.name}
    //         onChangeText={(name) => setWallet((w) => ({ ...w, name }))}
    //         onSubmitEditing={() => setWalletName(wallet)}
    //         onBlur={() => setWalletName(wallet)}
    //         autoFocus={!wallet.name}
    //         disabled={applying}
    //       />

    //       <SpendingSection
    //         wallet={wallet}
    //         limits={wallet.limits}
    //         setLimits={(f) => setWallet((w) => ({ ...w, limits: f(w.limits) }))}
    //         style={styles.section}
    //       />

    //       <QuorumsSection
    //         initialQuorums={initialWallet.quorums}
    //         quorums={wallet.quorums}
    //         setQuorums={(f) =>
    //           setWallet((w) => ({ ...w, quorums: f(w.quorums) }))
    //         }
    //         style={styles.section}
    //       />
    //     </ScrollView>

    //     {upsertWallet && !isUserEqual(initialWallet, wallet) && (
    //       <FAB
    //         icon={CheckIcon}
    //         label="Apply"
    //         loading={applying}
    //         onPress={async () => {
    //           const apply = () => upsertWallet(wallet);

    //           if (initialWallet.state.proposedModification) {
    //             confirm({
    //               onConfirm: apply,
    //               ...APPLY_CONFIRMATION,
    //             });
    //           } else {
    //             apply();
    //           }
    //         }}
    //       />
    //     )}
    //   </Box>
    // );
  },
  ScreenSkeleton,
);

const useStyles = makeStyles(({ space }) => ({
  sections: {
    marginHorizontal: space(2),
  },
  section: {
    marginTop: space(2),
  },
  endButton: {
    alignSelf: 'flex-end',
    marginTop: space(1),
  },
}));
