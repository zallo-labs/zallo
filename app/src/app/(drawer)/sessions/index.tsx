import { useRouter } from 'expo-router';
import { ScanIcon } from '@theme/icons';
import { StyleSheet, FlatList } from 'react-native';
import { useWalletConnect } from '~/util/walletconnect';
import { PairingItem } from '~/components/walletconnect/PairingItem';
import { Divider, Text } from 'react-native-paper';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { ScrollableScreenSurface } from '~/components/layout/ScrollableScreenSurface';
import { Fab } from '~/components/Fab';

function SessionsScreen() {
  const router = useRouter();
  const client = useWalletConnect();

  const pairings = client.pairing.values;

  return (
    <>
      <AppbarOptions mode="large" leading="menu" headline="Sessions" />

      <ScrollableScreenSurface>
        <FlatList
          data={pairings}
          renderItem={({ item, index }) => (
            <>
              <PairingItem pairing={item} />
              {index < pairings.length - 1 && <Divider />}
            </>
          )}
          ListEmptyComponent={
            <Text variant="titleMedium" style={styles.text}>
              Start a session by scanning a WalletConnect QR
            </Text>
          }
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />

        <Fab icon={ScanIcon} label="Scan" onPress={() => router.push(`/scan/`)} />
      </ScrollableScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  text: {
    margin: 16,
  },
});

export default withSuspense(SessionsScreen, <ScreenSkeleton />);
