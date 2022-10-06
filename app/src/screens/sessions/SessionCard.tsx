import { SessionTypes } from '@walletconnect/types';
import { Button, Text } from 'react-native-paper';
import { Card } from '~/components/card/Card';
import { Timestamp } from '~/components/format/Timestamp';
import { Box } from '~/components/layout/Box';
import { useWalletConnect } from '~/util/walletconnect/WalletConnectProvider';
import { ProposerDetails } from '../walletconnect/Proposal/ProposerDetails';
import { getSdkError } from '@walletconnect/utils';
import { CloseIcon } from '@theme/icons';
import useAsyncEffect from 'use-async-effect';
import { useCallback } from 'react';
import { tryOr, tryOrIgnore } from 'lib';

export interface SessionCardProps {
  session: SessionTypes.Struct;
}

export const SessionCard = ({ session }: SessionCardProps) => {
  const { client, withClient } = useWalletConnect();

  const disconnect = useCallback(async () => {
    withClient((client) =>
      tryOrIgnore(() =>
        client.disconnect({
          topic: session.topic,
          reason: getSdkError('USER_DISCONNECTED'),
        }),
      ),
    );
  }, [session.topic, withClient]);

  useAsyncEffect(async () => {
    tryOr(() => client.ping({ topic: session.topic }), disconnect);
  }, [session]);

  return (
    <Card>
      <ProposerDetails proposer={session.peer} />

      <Box horizontal mt={1}>
        <Text variant="titleSmall">Expires: </Text>
        <Text variant="bodyMedium">
          <Timestamp time>{session.expiry}</Timestamp>
        </Text>
      </Box>

      <Box horizontal justifyContent="flex-end">
        <Button
          mode="text"
          labelStyle={{ width: 72 }}
          icon={CloseIcon}
          onPress={disconnect}
        >
          Disconnect
        </Button>
      </Box>
    </Card>
  );
};
