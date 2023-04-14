import { ScanIcon, WalletConnectIcon } from '@theme/icons';
import { StyleSheet } from 'react-native';
import { FlatList } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { EmptyListFallback } from '~/components/EmptyListFallback';
import { Box } from '~/components/layout/Box';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useWalletConnect } from '~/util/walletconnect';
import { SessionCard } from './SessionCard';

export type SessionsScreenProps = StackNavigatorScreenProps<'Sessions'>;

export const SessionsScreen = ({ navigation: { navigate, goBack } }: SessionsScreenProps) => {
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const client = useWalletConnect();

  return (
    <Box>
      <AppbarHeader mode="large">
        {/* TODO: replace with AppbarMenu once issue is fixed: https://github.com/callstack/react-native-paper/issues/3287 */}
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title="Sessions" />
        <Appbar.Action icon={ScanIcon} onPress={() => navigate('Scan', {})} />
      </AppbarHeader>

      <FlatList
        renderItem={({ item }) => <SessionCard session={item} />}
        ItemSeparatorComponent={() => <Box mt={2} />}
        ListEmptyComponent={
          <EmptyListFallback
            Icon={WalletConnectIcon}
            title="No active sessions"
            subtitle="Pair by scanning a WalletConnect QR code"
          />
        }
        data={client.session.values}
        style={styles.list}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  list: {
    marginHorizontal: 16,
  },
});
