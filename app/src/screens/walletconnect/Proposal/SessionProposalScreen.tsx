import { Button, Dialog } from 'react-native-paper';
import { DialogRoot } from '~/components/DialogRoot';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useWalletConnectClients } from '~/util/walletconnect/WalletConnectProvider';
import { ProposerDetails } from './ProposerDetails';
import { useEffect, useState } from 'react';
import { SessionAccounts } from './SessionAccounts';
import { useUserIds } from '~/queries/user/useUserIds.api';
import { showError } from '~/provider/SnackbarProvider';
import { useWalletConnect } from '~/util/walletconnect/useWalletConnect';
import { WcProposer } from '~/util/walletconnect/useWalletConnectSessions';

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
  const { client } = useWalletConnectClients();
  const wc = useWalletConnect();
  const [allUsers] = useUserIds();

  const [users, setUsers] = useState(allUsers);

  // Handle session proposal expiry -- only for v2
  useEffect(() => {
    const handleExpiry = ({ id: expiredId }: { id: number }) => {
      if (expiredId === id) {
        showError('Session proposal expired');
        navigation.goBack();
      }
    };
    client.on('proposal_expire', handleExpiry);

    return () => {
      client.removeListener('proposal_expire', handleExpiry);
    };
  }, [client, id, navigation]);

  return (
    <DialogRoot>
      <Dialog.Title>Session proposal</Dialog.Title>

      <Dialog.Content>
        <ProposerDetails proposer={proposer} padding="vertical" />
        <SessionAccounts users={users} setUsers={setUsers} />
      </Dialog.Content>

      <Dialog.Actions>
        <Button
          onPress={() => {
            wc.session.reject(uri, id, 'USER_REJECTED');
            navigation.goBack();
          }}
        >
          Reject
        </Button>

        <Button
          onPress={async () => {
            try {
              wc.session.approve(
                uri,
                id,
                users.map((user) => user.account),
              );
            } catch {
              showError('Failed to establish wallet connect session');
            }

            navigation.goBack();
          }}
        >
          Connect
        </Button>
      </Dialog.Actions>
    </DialogRoot>
  );
};
