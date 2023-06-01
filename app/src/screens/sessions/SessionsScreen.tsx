import { ScanIcon, WalletConnectIcon } from '@theme/icons';
import { StyleSheet } from 'react-native';
import { EmptyListFallback } from '~/components/EmptyListFallback';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useWalletConnect } from '~/util/walletconnect';
import { Screen } from '~/components/layout/Screen';
import { Appbar } from '~/components/Appbar/Appbar';
import { FlashList } from '@shopify/flash-list';
import { PairingItem } from './PairingItem';
import { ListItemHeight } from '~/components/list/ListItem';
import { Divider } from 'react-native-paper';
import { Address } from 'lib';

export interface SessionsScreenParams {
  account: Address;
}

export type SessionsScreenProps = StackNavigatorScreenProps<'Sessions'>;

export const SessionsScreen = ({ route, navigation: { navigate } }: SessionsScreenProps) => {
  const { account } = route.params;
  const client = useWalletConnect();

  const pairings = client.pairing.values;

  return (
    <Screen>
      <Appbar
        mode="large"
        leading="back"
        headline="Sessions"
        trailing={(props) => <ScanIcon {...props} onPress={() => navigate('Scan', { account })} />}
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
    </Screen>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 8,
  },
});
