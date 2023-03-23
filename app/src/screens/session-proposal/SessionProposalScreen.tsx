import { useEffect } from 'react';
import { Appbar, Button } from 'react-native-paper';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { ProposerDetails } from './ProposerDetails';
import { SessionAccounts } from './SessionAccounts';
import { showError } from '~/provider/SnackbarProvider';
import { toNamespaces } from '~/util/walletconnect/namespaces';
import { getSdkError } from '@walletconnect/utils';
import { Box } from '~/components/layout/Box';
import { Actions } from '~/components/layout/Actions';
import { useImmer } from 'use-immer';
import { useWalletConnect, WalletConnectPeer } from '~/util/walletconnect';
import { AccountId } from '@api/account';
import { tryOrCatchAsync } from 'lib';
import { StyleSheet } from 'react-native';

export interface SessionProposalScreenParams {
  id: number;
  peer: WalletConnectPeer;
}

export type SessionProposalScreenProps = StackNavigatorScreenProps<'SessionProposal'>;

export const SessionProposalScreen = ({ route, navigation }: SessionProposalScreenProps) => {
  const { id, peer } = route.params;
  const client = useWalletConnect();

  const [accounts, setAccounts] = useImmer<Set<AccountId>>(new Set());

  // Handle session proposal expiry -- only for v2
  useEffect(() => {
    const handleExpiry = ({ id: expiredId }: { id: number }) => {
      if (expiredId === id) {
        showError('Session proposal expired, please try again');
        navigation.goBack();
      }
    };
    client.on('proposal_expire', handleExpiry);

    return () => {
      client.removeListener('proposal_expire', handleExpiry);
    };
  }, [client, id, navigation]);

  const approve = async () => {
    await tryOrCatchAsync(
      () => client.approve({ id, namespaces: toNamespaces(accounts) }),
      () => showError('Failed to establish wallet connect session'),
    );
    navigation.goBack();
  };

  const reject = () => {
    client.reject({ id, reason: getSdkError('USER_REJECTED') });
    navigation.goBack();
  };

  return (
    <Box flex={1}>
      <Appbar.Header>
        <Appbar.Content title="Session Proposal" />
      </Appbar.Header>

      <Box flex={1} mx={2}>
        <ProposerDetails proposer={peer} />

        <SessionAccounts selected={accounts} setSelected={setAccounts} style={styles.accounts} />
      </Box>

      <Actions horizontal>
        <Button onPress={reject}>Reject</Button>
        <Button mode="contained" onPress={approve} disabled={!Object.keys(accounts).length}>
          Connect
        </Button>
      </Actions>
    </Box>
  );
};

const styles = StyleSheet.create({
  accounts: {
    marginTop: 24,
  },
});
