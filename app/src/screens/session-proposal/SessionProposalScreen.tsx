import { Appbar, Button, Dialog } from 'react-native-paper';
import { DialogRoot } from '~/components/DialogRoot';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useWalletConnectClients } from '~/util/walletconnect/WalletConnectProvider';
import { ProposerDetails } from './ProposerDetails';
import { useEffect, useState } from 'react';
import { SessionAccounts } from './SessionAccounts';
import { useUserIds } from '~/queries/user/useUserIds.api';
import { showError } from '~/provider/SnackbarProvider';
import { WcProposer } from '~/util/walletconnect/useWalletConnectSessions';
import { toNamespaces } from '~/util/walletconnect/namespaces';
import { CHAIN_ID } from '@network/provider';
import { getSdkError } from '@walletconnect/utils';
import { Box } from '~/components/layout/Box';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { ExternalLinkIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Actions } from '~/components/layout/Actions';

export interface SessionProposalScreenParams {
  uri?: string;
  id: number;
  proposer: WcProposer;
}

export type SessionProposalScreenProps =
  RootNavigatorScreenProps<'SessionProposal'>;

export const SessionProposalScreen = ({
  route,
  navigation,
}: SessionProposalScreenProps) => {
  const { uri, id, proposer } = route.params;
  const styles = useStyles();
  const [allUsers] = useUserIds();
  const {
    client: clientV2,
    withClient: withClientV2,
    withConnectionV1,
  } = useWalletConnectClients();

  const [users, setUsers] = useState(allUsers);

  // Handle session proposal expiry -- only for v2
  useEffect(() => {
    const handleExpiry = ({ id: expiredId }: { id: number }) => {
      if (expiredId === id) {
        showError('Session proposal expired');
        navigation.goBack();
      }
    };
    clientV2.on('proposal_expire', handleExpiry);

    return () => {
      clientV2.removeListener('proposal_expire', handleExpiry);
    };
  }, [clientV2, id, navigation]);

  const approve = () => {
    try {
      if (uri) {
        withConnectionV1(uri, (connection) => {
          connection.approveSession({
            accounts: users.map((u) => u.account),
            chainId: CHAIN_ID(),
          });
        });
      } else {
        withClientV2((client) => {
          client.approve({
            id,
            namespaces: toNamespaces(users.map((u) => u.account)),
          });
        });
      }
    } catch {
      showError('Failed to establish wallet connect session');
    }

    navigation.goBack();
  };

  const reject = () => {
    const reason = getSdkError('USER_REJECTED');
    if (uri) {
      withConnectionV1(uri, (connection) => {
        connection.rejectSession({
          message: reason.message,
        });
      });
    } else {
      withClientV2((client) => {
        client.reject({ id, reason });
      });
    }

    navigation.goBack();
  };

  return (
    <Box flex={1}>
      <Appbar.Header>
        <Appbar.Content title="Session Proposal" />
      </Appbar.Header>

      <Box flex={1} mx={2}>
        <ProposerDetails proposer={proposer} />

        <SessionAccounts
          users={users}
          setUsers={setUsers}
          style={styles.accounts}
        />
      </Box>

      <Actions>
        <Button onPress={reject}>Reject</Button>
        <Button mode="contained" onPress={approve} disabled={!users.length}>
          Connect
        </Button>
      </Actions>
    </Box>
  );
};

const useStyles = makeStyles(({ space }) => ({
  accounts: {
    marginTop: space(3),
  },
}));
