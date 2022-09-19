import { makeStyles } from '@theme/makeStyles';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';

export interface UserScreenParams {}

export type UserScreenProps = RootNavigatorScreenProps<'User'>;

export const UserScreen = withSkeleton(({ route }: UserScreenProps) => {
  // const { account, id } = route.params;
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
}, ScreenSkeleton);

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
