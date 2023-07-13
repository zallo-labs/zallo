import { QrCodeIcon, SendIcon, SwapIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Address } from 'lib';
import { useSelectAddress } from '../addresses/useSelectAddress';

export interface QuickActionsProps {
  account: Address;
}

export const QuickActions = ({ account }: QuickActionsProps) => {
  const { navigate } = useNavigation();
  const selectAddress = useSelectAddress();

  const send = async () =>
    navigate('Send', { account, to: await selectAddress({ disabled: ['approvers'] }) });
  const receive = () => navigate('QrModal', { address: account });

  return (
    <View style={styles.container}>
      <Button icon={SendIcon} mode="contained-tonal" style={styles.button} onPress={send}>
        Send
      </Button>

      <Button icon={QrCodeIcon} mode="contained-tonal" style={styles.button} onPress={receive}>
        Receive
      </Button>

      <Button
        icon={SwapIcon}
        mode="contained-tonal"
        style={styles.button}
        onPress={() => navigate('Swap', { account })}
      >
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
