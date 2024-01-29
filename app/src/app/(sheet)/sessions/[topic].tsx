import { useRouter } from 'expo-router';
import { getSdkError } from '@walletconnect/utils';
import { StyleSheet } from 'react-native';
import { ListItem } from '~/components/list/ListItem';
import { Sheet } from '~/components/sheet/Sheet';
import { useUpdateWalletConnect, useWalletConnect } from '~/util/walletconnect';
import * as Linking from 'expo-linking';
import { CloseIcon, ExternalLinkIcon } from '@theme/icons';
import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';

const SessionDetailsSheetParams = z.object({ topic: z.string() });

export default function SessionDetailsSheet() {
  const { topic } = useLocalParams(SessionDetailsSheetParams);
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
