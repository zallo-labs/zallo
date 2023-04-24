import { getSdkError } from '@walletconnect/utils';
import { StyleSheet } from 'react-native';
import { ListItem } from '~/components/list/ListItem';
import { Sheet } from '~/components/sheet/Sheet';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useWalletConnect } from '~/util/walletconnect';
import * as Linking from 'expo-linking';
import { CloseIcon, ExternalLinkIcon } from '@theme/icons';

export interface PairingSheetParams {
  topic: string;
}

export type PairingSheetProps = StackNavigatorScreenProps<'PairingSheet'>;

export const PairingSheet = ({ route, navigation: { goBack } }: PairingSheetProps) => {
  const { topic } = route.params;
  const client = useWalletConnect();
  const pairing = client.pairing.getAll({ topic })?.[0];
  const session = client.session.getAll({ pairingTopic: topic })?.[0];

  const metadata = pairing.peerMetadata ?? session.peer.metadata;

  const open = metadata.url && (() => Linking.openURL(metadata.url));

  const forget =
    pairing && (() => client.disconnect({ topic, reason: getSdkError('USER_DISCONNECTED') }));

  return (
    <Sheet onClose={goBack} contentContainerStyle={styles.container}>
      {open && <ListItem leading={ExternalLinkIcon} headline="Open" onPress={open} />}
      {forget && <ListItem leading={CloseIcon} headline="Forget" onPress={forget} />}
    </Sheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
});
