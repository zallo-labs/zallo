import { Button, Text } from 'react-native-paper';
import { Card } from '~/components/card/Card';
import { Timestamp } from '~/components/format/Timestamp';
import { Box } from '~/components/layout/Box';
import { ProposerDetails } from '../session-proposal/ProposerDetails';
import { CloseIcon } from '@theme/icons';
import { useEffect } from 'react';
import { tryOrIgnore } from 'lib';
import { WcSessionData } from '~/util/walletconnect/useWalletConnectSessions';
import { useSession } from '~/util/walletconnect/useTopic';

export interface SessionCardProps {
  sessionData: WcSessionData;
}

export const SessionCard = ({ sessionData }: SessionCardProps) => {
  const session = useSession(sessionData.topic);

  useEffect(() => {
    session.checkConnectedOrDisconnect();
  }, [session]);

  return (
    <Card>
      <ProposerDetails proposer={sessionData.proposer} />

      {sessionData.expiry && (
        <Box horizontal mt={1}>
          <Text variant="titleSmall">Expires: </Text>
          <Text variant="bodyMedium">
            <Timestamp time>{sessionData.expiry}</Timestamp>
          </Text>
        </Box>
      )}

      <Box horizontal justifyContent="flex-end">
        <Button
          mode="text"
          labelStyle={{ width: 72 }}
          icon={CloseIcon}
          onPress={() =>
            tryOrIgnore(() => session.disconnect('USER_DISCONNECTED'))
          }
        >
          Disconnect
        </Button>
      </Box>
    </Card>
  );
};
