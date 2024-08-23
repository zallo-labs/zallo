import { WalletConnectColorIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { useEffect } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { z } from 'zod';
import { Sheet } from '#/sheet/Sheet';
import { useLocalParams } from '~/hooks/useLocalParams';
import { useWalletConnectWithoutWatching } from '~/lib/wc';
import { zWalletConnectUri } from '~/lib/wc/uri';
import { showError } from '#/Snackbar';
import { useRouter } from 'expo-router';

export const WalletConnectUriScreenParams = z.object({ uri: zWalletConnectUri() });

export default function WalletConnectUriScreen() {
  const { uri } = useLocalParams(WalletConnectUriScreenParams);
  const { styles } = useStyles(stylesheet);
  const router = useRouter();
  const client = useWalletConnectWithoutWatching();

  useEffect(() => {
    (async () => {
      try {
        await client.pair({ uri });
      } catch (e) {
        const alreadyExists = e instanceof Error && e.message.includes('already exists');
        if (!alreadyExists) {
          showError('Something went wrong while connecting to the dapp. Please try again.', {
            event: { error: e },
          });
        }
        router.back();
      }
    })();
  }, [client, router, uri]);

  return (
    <Sheet handle={false} contentContainerStyle={styles.container}>
      <WalletConnectColorIcon size={styles.icon.width} />

      <View style={styles.connectingContainer}>
        <ActivityIndicator style={styles.activity} />

        <Text variant="headlineMedium">Connecting with dapp</Text>

        <View style={styles.activity} />
      </View>
    </Sheet>
  );
}

const stylesheet = createStyles(({ fonts }) => ({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 80,
  },
  connectingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  activity: {
    width: fonts.headlineMedium.fontSize,
  },
}));

export { ErrorBoundary } from '#/ErrorBoundary';
