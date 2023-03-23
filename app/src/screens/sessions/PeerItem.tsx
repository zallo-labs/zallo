import { Text } from 'react-native-paper';
import { LabelIcon } from '~/components/Identicon/LabelIcon';
import { Item } from '~/components/item/Item';
import { Image } from 'expo-image';
import { WalletConnectPeer } from '~/util/walletconnect';

export interface PeerItemProps {
  peer: WalletConnectPeer;
}

export const PeerItem = ({ peer }: PeerItemProps) => (
  <Item
    Left={
      peer.icons.length ? <Image source={peer.icons} /> : <LabelIcon label={peer.name || '?'} />
    }
    Main={<Text variant="titleMedium">{peer.name || 'Unnamed DApp'}</Text>}
  />
);
