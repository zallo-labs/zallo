import { Image } from 'expo-image';
import { ListItem } from '~/components/list/ListItem';
import { SessionTypes, PairingTypes } from '@walletconnect/types';
import { ICON_SIZE } from '@theme/paper';
import { StyleSheet } from 'react-native';
import { MoreVerticalIcon } from '@theme/icons';
import { Link } from 'expo-router';
import { P, match } from 'ts-pattern';

export interface PairingItemProps {
  pairing: PairingTypes.Struct & { session?: SessionTypes.Struct };
}

export const PairingItem = ({ pairing: p }: PairingItemProps) => {
  const peer = p.peerMetadata ?? p.session?.peer.metadata;

  return (
    <Link href={{ pathname: `/(sheet)/sessions/[topic]`, params: { topic: p.topic } }} asChild>
      <ListItem
        leading={
          peer && peer.icons.length > 0
            ? (props) => <Image source={peer.icons} style={styles.icon} {...props} />
            : peer?.name || '?'
        }
        headline={peer?.name || 'Unnamed DApp'}
        supporting={match(p)
          .with({ session: P.not(P.nullish) }, () => 'Active')
          .with({ active: true }, () => 'Paired')
          .otherwise(() => 'Expired')}
        trailing={MoreVerticalIcon}
      />
    </Link>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: ICON_SIZE.medium,
    height: ICON_SIZE.medium,
  },
});
