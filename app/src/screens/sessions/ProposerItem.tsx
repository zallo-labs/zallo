import { Text } from 'react-native-paper';
import { LabelIcon } from '~/components/Identicon/LabelIcon';
import { Item } from '~/components/item/Item';
import UriImage from '~/components/UriImage';
import { WcProposer } from '~/util/walletconnect/useWalletConnectSessions';
import { UNNAMED_DAPP_NAME } from '../session-proposal/ProposerDetails';

export interface ProposerItemProps {
  proposer: WcProposer;
}

export const ProposerItem = ({ proposer: p }: ProposerItemProps) => {
  const name = p.name || UNNAMED_DAPP_NAME;

  return (
    <Item
      Left={p.icons.length ? <UriImage uri={p.icons} /> : <LabelIcon label={name} />}
      Main={<Text variant="titleMedium">{name}</Text>}
    />
  );
};
