import { Text } from 'react-native-paper';
import { LabelIcon } from '~/components/Identicon/LabelIcon';
import { Item } from '~/components/item/Item';
import { Image } from '~/components/Image';
import { UNNAMED_DAPP_NAME } from '../session-proposal/ProposerDetails';
import { WalletConnectPeer } from '~/util/walletconnect';

export interface PeerItemProps {
  peer: WalletConnectPeer;
}

export const PeerItem = ({ peer }: PeerItemProps) => {
  const name = peer.name || UNNAMED_DAPP_NAME;

  return (
    <Item
      Left={peer.icons.length ? <Image source={peer.icons} /> : <LabelIcon label={name} />}
      Main={<Text variant="titleMedium">{name}</Text>}
    />
  );
};
