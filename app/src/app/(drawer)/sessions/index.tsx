import { useRouter } from 'expo-router';
import { ScanIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { useWalletConnect } from '~/util/walletconnect';
import { FlashList } from '@shopify/flash-list';
import { PairingItem } from '~/components/walletconnect/PairingItem';
import { ListItemHeight } from '~/components/list/ListItem';
import { Divider, Text } from 'react-native-paper';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';

function SessionsScreen() {
  const router = useRouter();
  const client = useWalletConnect();

  const pairings = client.pairing.values;

  return (
    <View style={styles.root}>
      <AppbarOptions
        mode="large"
        leading="menu"
        headline="Sessions"
        trailing={(props) => <ScanIcon {...props} onPress={() => router.push(`/scan/`)} />}
      />

      <FlashList
        data={pairings}
        renderItem={({ item, index }) => (
          <>
            <PairingItem pairing={item} />
            {index < pairings.length - 1 && <Divider />}
          </>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="headlineMedium">No active sessions</Text>
            <Text variant="titleMedium">
              Start a session by scanning a WalletConnect QR code on a DApp
            </Text>
          </View>
        }
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={ListItemHeight.TRIPLE_LINE}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 8,
  },
  emptyContainer: {
    marginVertical: 8,
    marginHorizontal: 16,
    gap: 8,
  },
});

export default withSuspense(SessionsScreen, <ScreenSkeleton />);
