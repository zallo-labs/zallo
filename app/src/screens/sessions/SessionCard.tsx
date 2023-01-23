import { Button, Text } from 'react-native-paper';
import { Card } from '~/components/card/Card';
import { Timestamp } from '~/components/format/Timestamp';
import { Box } from '~/components/layout/Box';
import { CloseIcon } from '@theme/icons';
import { useEffect } from 'react';
import { tryOrIgnoreAsync } from 'lib';
import { WcSessionData } from '~/util/walletconnect/useWalletConnectSessions';
import { useSession } from '~/util/walletconnect/useTopic';
import { ProposerItem } from './ProposerItem';

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
      <ProposerItem proposer={sessionData.proposer} />

      {sessionData.expiry && (
        <Box horizontal mt={2}>
          <Text variant="titleSmall">Expires: </Text>
          <Text variant="bodyMedium">
            <Timestamp timestamp={sessionData.expiry} />
          </Text>
        </Box>
      )}

      <Box horizontal justifyContent="flex-end">
        <Button
          mode="text"
          labelStyle={{
            flexGrow: 1,
            // width: 72
          }}
          icon={CloseIcon}
          onPress={() => tryOrIgnoreAsync(() => session.disconnect('USER_DISCONNECTED'))}
        >
          Disconnect
        </Button>
      </Box>
    </Card>
  );
};
