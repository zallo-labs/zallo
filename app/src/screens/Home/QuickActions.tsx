import { QrCodeIcon, SendIcon, SwapIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useRootNavigation2 } from '~/navigation/useRootNavigation';
import { useScanAddress } from '../Scan/useScanAddress';

export const QuickActions = () => {
  const { navigate } = useRootNavigation2();
  const scan = useScanAddress();

  const send = async () => navigate('Send', { to: await scan() });

  return (
    <View style={styles.container}>
      <Button icon={SendIcon} mode="contained-tonal" style={styles.button} onPress={send}>
        Send
      </Button>

      <Button icon={QrCodeIcon} mode="contained-tonal" style={styles.button}>
        Receive
      </Button>

      <Button icon={SwapIcon} mode="contained-tonal" style={styles.button} disabled>
        Swap
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    gap: 16,
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
  },
});
