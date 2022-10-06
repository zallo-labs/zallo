import { Button, Dialog } from 'react-native-paper';
import { DialogRoot } from '~/components/DialogRoot';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { WcEventParams } from '~/util/walletconnect/methods';
import { useNamespaces } from '~/screens/walletconnect/Proposal/useNamespaces';
import { useWalletConnect } from '~/util/walletconnect/WalletConnectProvider';
import { ProposerDetails } from './ProposerDetails';
import { useEffect, useState } from 'react';
import { SessionAccounts } from './SessionAccounts';
import { useUserIds } from '~/queries/user/useUserIds.api';
import { showError } from '~/provider/SnackbarProvider';
import { getSdkError } from '@walletconnect/utils';

export interface SessionProposalScreenParams {
  proposal: WcEventParams['session_proposal'];
}

export type SessionProposalScreenProps =
  RootNavigatorScreenProps<'SessionProposal'>;

export const SessionProposalScreen = ({
  route,
  navigation,
}: SessionProposalScreenProps) => {
  const { id, params } = route.params.proposal;
  const { client, withClient } = useWalletConnect();
  const [allUsers] = useUserIds();

  const [users, setUsers] = useState(allUsers);
  const namespaces = useNamespaces(users.map((user) => user.account));

  useEffect(() => {
    const handleExpiry = () => {
      showError('Session proposal expired');
      navigation.goBack();
    };
    client.on('proposal_expire', handleExpiry);

    return () => {
      client.removeListener('proposal_expire', handleExpiry);
    };
  }, [client, navigation]);

  return (
    <DialogRoot>
      <Dialog.Title>Session proposal</Dialog.Title>

      <Dialog.Content>
        <ProposerDetails proposer={params.proposer} padding="vertical" />
        <SessionAccounts users={users} setUsers={setUsers} />
      </Dialog.Content>

      <Dialog.Actions>
        <Button
          mode="text"
          onPress={() => {
            withClient((client) => {
              client.reject({ id, reason: getSdkError('USER_REJECTED') });
            });
            navigation.goBack();
          }}
        >
          Reject
        </Button>

        <Button
          mode="contained"
          onPress={async () => {
            try {
              withClient((client) =>
                client.approve({
                  id,
                  namespaces,
                }),
              );
            } catch {
              showError('Failed to establish session');
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
