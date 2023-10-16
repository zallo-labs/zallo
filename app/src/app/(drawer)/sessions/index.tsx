import { SearchParams, useRouter } from 'expo-router';
import { ScanIcon, WalletConnectIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { EmptyListFallback } from '~/components/EmptyListFallback';
import { useWalletConnect } from '~/util/walletconnect';
import { FlashList } from '@shopify/flash-list';
import { PairingItem } from '~/components/walletconnect/PairingItem';
import { ListItemHeight } from '~/components/list/ListItem';
import { Divider } from 'react-native-paper';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';

export type SessionsScreenRoute = `/sessions/`;
export type SessionsScreenParams = SearchParams<SessionsScreenRoute>;

export default function SessionsScreen() {
  const router = useRouter();
  const client = useWalletConnect();

  const pairings = client.pairing.values;

  return (
    <View style={styles.root}>
      <AppbarOptions
        mode="large"
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
          <EmptyListFallback
            Icon={WalletConnectIcon}
            title="No active sessions"
            subtitle="Pair by scanning a WalletConnect QR code"
          />
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
});
