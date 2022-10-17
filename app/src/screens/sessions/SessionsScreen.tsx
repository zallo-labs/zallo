import { ScanIcon, WalletConnectIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { FlatList } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { EmptyListFallback } from '~/components/EmptyListFallback';
import { Box } from '~/components/layout/Box';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useWalletConnectSessions } from '~/util/walletconnect/useWalletConnectSessions';
import { SessionCard } from './SessionCard';

export type SessionsScreenProps = RootNavigatorScreenProps<'Sessions'>;

export const SessionsScreen = ({ navigation }: SessionsScreenProps) => {
  const styles = useStyles();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const sessions = [...useWalletConnectSessions().values()];

  return (
    <Box>
      <AppbarHeader mode="large">
        {/* TODO: replace with AppbarMenu once issue is fixed: https://github.com/callstack/react-native-paper/issues/3287 */}
        <Appbar.BackAction onPress={useGoBack()} />
        <Appbar.Content title="Sessions" />
        <Appbar.Action
          icon={ScanIcon}
          onPress={() => navigation.navigate('Scan', {})}
        />
      </AppbarHeader>

      <FlatList
        renderItem={({ item }) => <SessionCard sessionData={item} />}
        ItemSeparatorComponent={() => <Box mt={2} />}
        ListEmptyComponent={
          <EmptyListFallback
            Icon={WalletConnectIcon}
            title="No active sessions"
            subtitle="Pair by scanning a WalletConnect QR code"
          />
        }
        data={sessions}
        style={styles.list}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
};

const useStyles = makeStyles(({ space }) => ({
  list: {
    marginHorizontal: space(2),
  },
}));
