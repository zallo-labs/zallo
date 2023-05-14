import { useAccountIds } from '@api/account';
import { makeStyles } from '@theme/makeStyles';
import { getSdkError } from '@walletconnect/utils';
import { tryOrCatchAsync } from 'lib';
import { Text } from 'react-native-paper';
import { useImmer } from 'use-immer';
import { Button } from '~/components/Button';
import { Actions } from '~/components/layout/Actions';
import { Sheet } from '~/components/sheet/Sheet';
import { AccountsList } from '~/components/walletconnect/AccountsList';
import { PeerHeader } from '~/components/walletconnect/PeerHeader';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { showError, showSuccess } from '~/provider/SnackbarProvider';
import {
  WalletConnectEventArgs,
  toNamespaces,
  useUpdateWalletConnect,
  useWalletConnect,
} from '~/util/walletconnect';

export type ConnectSheetParams = WalletConnectEventArgs['session_proposal'];

export type ConnectSheetProps = StackNavigatorScreenProps<'ConnectSheet'>;

export const ConnectSheet = ({ navigation: { goBack }, route }: ConnectSheetProps) => {
  const { id, params } = route.params;
  const styles = useStyles();
  const client = useWalletConnect();
  const update = useUpdateWalletConnect();

  const accounts = useAccountIds();
  const [selected, updateSelected] = useImmer(new Set(accounts));

  const connect = async () => {
    const req = await tryOrCatchAsync(
      () => client.approve({ id, namespaces: toNamespaces(selected) }),
      (error) => showError('Failed to connect to DApp, please try again', { event: { error } }),
    );
    goBack();

    if (req) {
      try {
        await req.acknowledged();
        update();
        showSuccess('Connected');
      } catch (error) {
        showError('DApp failed to acknowledge connection, please try again', { event: { error } });
      }
    }
  };

  const reject = () => {
    client.reject({ id, reason: getSdkError('USER_REJECTED') });
    goBack();
  };

  const hasPaired = !!client.pairing.getAll({ topic: params.pairingTopic })?.[0];

  return (
    <Sheet onClose={reject}>
      <PeerHeader peer={params.proposer.metadata}>wants to connect</PeerHeader>

      {!hasPaired && (
        <Text variant="labelLarge" style={styles.pairWarning}>
          This is your first time connecting to this DApp
        </Text>
      )}

      <AccountsList selected={selected} updateSelected={updateSelected} />

      <Actions>
        <Button mode="contained" onPress={connect} disabled={selected.size === 0}>
          Connect
        </Button>
      </Actions>
    </Sheet>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  pairWarning: {
    marginHorizontal: 16,
    textAlign: 'center',
    color: colors.orange,
  },
}));
