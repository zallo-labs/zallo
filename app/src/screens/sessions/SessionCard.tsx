import { Button, Text } from 'react-native-paper';
import { Card } from '~/components/card/Card';
import { Timestamp } from '~/components/format/Timestamp';
import { Box } from '~/components/layout/Box';
import { CloseIcon } from '@theme/icons';
import { useEffect } from 'react';
import { tryOrIgnoreAsync } from 'lib';
import { PeerItem } from './PeerItem';
import { getSdkError } from '@walletconnect/utils';
import { useWalletConnect } from '~/util/walletconnect';
import { WalletConnectSession } from '~/util/walletconnect/types';
import { DateTime } from 'luxon';

export interface SessionCardProps {
  session: WalletConnectSession;
}

export const SessionCard = ({ session: { expiry, topic, peer } }: SessionCardProps) => {
  const client = useWalletConnect();

  useEffect(() => {
    // Ensure the session is alive
    tryOrIgnoreAsync(() => client.ping({ topic }));
  }, [client, topic]);

  return (
    <Card>
      <PeerItem peer={peer.metadata} />

      {expiry && (
        <Box horizontal mt={2}>
          <Text variant="titleSmall">Expires: </Text>
          <Text variant="bodyMedium">
            <Timestamp timestamp={DateTime.fromSeconds(expiry)} />
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
          onPress={() =>
            tryOrIgnoreAsync(() =>
              client.disconnect({
                topic,
                reason: getSdkError('USER_DISCONNECTED'),
              }),
            )
          }
        >
          Disconnect
        </Button>
      </Box>
    </Card>
  );
};
