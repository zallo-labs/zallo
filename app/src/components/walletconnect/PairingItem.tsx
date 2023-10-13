import { Image } from 'expo-image';
import { ListItem } from '~/components/list/ListItem';
import { SessionTypes, PairingTypes } from '@walletconnect/types';
import { ICON_SIZE } from '@theme/paper';
import { StyleSheet } from 'react-native';
import { useWalletConnect } from '~/util/walletconnect';
import { useTimestamp } from '~/components/format/Timestamp';
import { DateTime } from 'luxon';
import { MoreVerticalIcon } from '@theme/icons';
import { useRouter } from 'expo-router';

export interface PairingItemProps {
  pairing: PairingTypes.Struct;
}

export const PairingItem = ({ pairing }: PairingItemProps) => {
  const client = useWalletConnect();
  const router = useRouter();
  const session: SessionTypes.Struct | undefined = client.session.getAll({
    pairingTopic: pairing.topic,
  })?.[0];
  const peer = pairing.peerMetadata ?? session?.peer.metadata;

  const expiry = useTimestamp({ timestamp: DateTime.fromSeconds(pairing.expiry) });
  const status = session ? 'Connected' : pairing.active ? 'Paired' : `Expired ${expiry}`;
  const expires = status !== 'Expired' ? `Expires ${expiry}` : '';

  return (
    <ListItem
      leading={
        peer.icons.length > 0
          ? (props) => <Image source={peer.icons} style={styles.icon} {...props} />
          : peer.name || '?'
      }
      headline={peer.name || 'Unnamed DApp'}
      supporting={`${status}\n${expires}`}
      lines={3}
      trailing={MoreVerticalIcon}
      onPress={() =>
        router.push({ pathname: `/sessions/[topic]`, params: { topic: pairing.topic } })
      }
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: ICON_SIZE.medium,
    height: ICON_SIZE.medium,
  },
});
