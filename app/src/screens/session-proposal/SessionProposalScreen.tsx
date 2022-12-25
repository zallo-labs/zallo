import { useEffect } from 'react';
import { Appbar, Button } from 'react-native-paper';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useWalletConnectClients } from '~/util/walletconnect/WalletConnectProvider';
import { ProposerDetails } from './ProposerDetails';
import { SessionAccounts } from './SessionAccounts';
import { showError } from '~/provider/SnackbarProvider';
import { WcProposer } from '~/util/walletconnect/useWalletConnectSessions';
import { toNamespaces } from '~/util/walletconnect/namespaces';
import { CHAIN_ID } from '@network/provider';
import { getSdkError } from '@walletconnect/utils';
import { Box } from '~/components/layout/Box';
import { makeStyles } from '@theme/makeStyles';
import { Actions } from '~/components/layout/Actions';
import { useImmer } from 'use-immer';
import { SessionAccountQuorum, useSessionAccountQuorumsState } from './useSessionAccountQuorum';
import { Address } from 'lib';

export interface SessionProposalScreenParams {
  uri?: string;
  id: number;
  proposer: WcProposer;
}

export type SessionProposalScreenProps = RootNavigatorScreenProps<'SessionProposal'>;

export const SessionProposalScreen = ({ route, navigation }: SessionProposalScreenProps) => {
  const { uri, id, proposer } = route.params;
  const styles = useStyles();
  const {
    client: clientV2,
    withClient: withClientV2,
    withConnectionV1,
  } = useWalletConnectClients();
  const setAccountQuorums = useSessionAccountQuorumsState(id)[1];

  const [selected, setSelected] = useImmer<SessionAccountQuorum>({});

  // Handle session proposal expiry -- only for v2
  useEffect(() => {
    const handleExpiry = ({ id: expiredId }: { id: number }) => {
      if (expiredId === id) {
        showError('Session proposal expired, please try again');
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
      const accounts = Object.keys(selected) as Address[];
      if (uri) {
        withConnectionV1(uri, (connection) => {
          connection.approveSession({ accounts, chainId: CHAIN_ID() });
        });
      } else {
        withClientV2((client) => {
          client.approve({ id, namespaces: toNamespaces(accounts) });
        });
      }

      setAccountQuorums(selected);
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

        <SessionAccounts selected={selected} setSelected={setSelected} style={styles.accounts} />
      </Box>

      <Actions
        primary={
          <Button mode="contained" onPress={approve} disabled={!Object.keys(selected).length}>
            Connect
          </Button>
        }
        secondary={<Button onPress={reject}>Reject</Button>}
      />
    </Box>
  );
};

const useStyles = makeStyles(({ space }) => ({
  accounts: {
    marginTop: space(3),
  },
}));
