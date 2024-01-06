import { StyleSheet } from 'react-native';
import { getSdkError } from '@walletconnect/utils';
import * as Linking from 'expo-linking';
import { SearchParams, useLocalSearchParams, useRouter } from 'expo-router';

import { ListItem } from '~/components/list/ListItem';
import { Sheet } from '~/components/sheet/Sheet';
import { CloseIcon, ExternalLinkIcon } from '~/util/theme/icons';
import { useUpdateWalletConnect, useWalletConnect } from '~/util/walletconnect';

export type SessionDetailsSheetRoute = `/sessions/[topic]`;
export type SessionDetailsSheetParams = SearchParams<SessionDetailsSheetRoute>;

export default function SessionDetailsSheet() {
  const { topic } = useLocalSearchParams<SessionDetailsSheetParams>();
  const router = useRouter();
  const client = useWalletConnect();
  const update = useUpdateWalletConnect();
  const pairing = client.pairing.getAll({ topic })?.[0];
  const session = client.session.getAll({ pairingTopic: topic })?.[0];

  // Close sheet if the pairing doesn't exist anymore
  if (!pairing) {
    router.back();
    return null;
  }

  const metadata = pairing.peerMetadata ?? session.peer.metadata;

  const open = metadata.url && (() => Linking.openURL(metadata.url));

  const forget =
    pairing &&
    (async () => {
      router.back();
      await client.disconnect({ topic, reason: getSdkError('USER_DISCONNECTED') });
      update();
    });

  return (
    <Sheet contentContainerStyle={styles.container}>
      {open && <ListItem leading={ExternalLinkIcon} headline="Open" onPress={open} />}
      {forget && <ListItem leading={CloseIcon} headline="Forget" onPress={forget} />}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
});
