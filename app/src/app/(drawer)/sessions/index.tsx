import { FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Divider, Text } from 'react-native-paper';

import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { Fab } from '~/components/Fab';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { PairingItem } from '~/components/walletconnect/PairingItem';
import { ScanIcon } from '~/util/theme/icons';
import { useWalletConnect } from '~/util/walletconnect';

function SessionsScreen() {
  const router = useRouter();
  const client = useWalletConnect();

  const pairings = client.pairing.values;

  return (
    <>
      <AppbarOptions mode="large" leading="menu" headline="Sessions" />

      <ScreenSurface>
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
      </ScreenSurface>
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
