import { Image } from 'expo-image';
import { WalletConnectPeer } from '~/util/walletconnect';
import { ListItem } from '~/components/list/ListItem';

export interface PeerItemProps {
  peer: WalletConnectPeer;
}

export const PeerItem = ({ peer }: PeerItemProps) => (
  <ListItem
    leading={
      peer.icons.length ? (props) => <Image source={peer.icons} {...props} /> : peer.name || '?'
    }
    headline={peer.name || 'Unnamed DApp'}
  />
);
