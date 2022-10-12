import { Button, Text } from 'react-native-paper';
import { Card } from '~/components/card/Card';
import { Timestamp } from '~/components/format/Timestamp';
import { Box } from '~/components/layout/Box';
import { ProposerDetails } from '../walletconnect/Proposal/ProposerDetails';
import { CloseIcon } from '@theme/icons';
import { useEffect } from 'react';
import { tryOrIgnore } from 'lib';
import { useWalletConnect } from '~/util/walletconnect/useWalletConnect';
import { WcSession } from '~/util/walletconnect/useWalletConnectSessions';

export interface SessionCardProps {
  session: WcSession;
}

export const SessionCard = ({ session }: SessionCardProps) => {
  const wc = useWalletConnect();

  useEffect(() => {
    wc.session.checkConnectedOrDisconnect(session.topicOrUri);
  }, [session.topicOrUri, session.version, wc.session]);

  return (
    <Card>
      <ProposerDetails proposer={session.proposer} />

      {session.expiry && (
        <Box horizontal mt={1}>
          <Text variant="titleSmall">Expires: </Text>
          <Text variant="bodyMedium">
            <Timestamp time>{session.expiry}</Timestamp>
          </Text>
        </Box>
      )}

      <Box horizontal justifyContent="flex-end">
        <Button
          mode="text"
          labelStyle={{ width: 72 }}
          icon={CloseIcon}
          onPress={() =>
            tryOrIgnore(() =>
              wc.session.disconnect(session.topicOrUri, 'USER_DISCONNECTED'),
            )
          }
        >
          Disconnect
        </Button>
      </Box>
    </Card>
  );
};
