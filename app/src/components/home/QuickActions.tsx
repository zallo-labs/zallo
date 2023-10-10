import { QrCodeIcon, TransferIcon, SwapIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { Address } from 'lib';
import { useSelectAddress } from '~/screens/addresses/useSelectAddress';
import { useRouter } from 'expo-router';
import { TransferScreenParams } from '~/app/[account]/transfer';

export interface QuickActionsProps {
  account: Address;
}

export const QuickActions = ({ account }: QuickActionsProps) => {
  const { push } = useRouter();
  const selectAddress = useSelectAddress();

  return (
    <View style={styles.container}>
      <Button
        icon={TransferIcon}
        mode="contained-tonal"
        style={styles.button}
        onPress={async () => {
          const params: TransferScreenParams = {
            account,
            to: await selectAddress({ disabled: ['approvers'] }),
          };
          push({ pathname: `/[account]/transfer`, params });
        }}
      >
        Transfer
      </Button>

      <Button
        icon={QrCodeIcon}
        mode="contained-tonal"
        style={styles.button}
        onPress={() => push({ pathname: `/[account]/receive`, params: { account } })}
      >
        Receive
      </Button>

      <Button
        icon={SwapIcon}
        mode="contained-tonal"
        style={styles.button}
        onPress={() => push({ pathname: `/[account]/swap`, params: { account } })}
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
