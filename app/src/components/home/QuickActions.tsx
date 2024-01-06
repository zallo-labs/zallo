import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'react-native-paper';

import { UAddress } from 'lib';
import { useTransfer } from '~/hooks/useTransfer';
import { QrCodeIcon, SwapIcon, TransferIcon } from '~/util/theme/icons';

export interface QuickActionsProps {
  account: UAddress;
}

export function QuickActions({ account }: QuickActionsProps) {
  const { push } = useRouter();
  const transfer = useTransfer();

  return (
    <View style={styles.container}>
      <Button
        icon={TransferIcon}
        mode="contained-tonal"
        style={styles.button}
        onPress={() => transfer({ account })}
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
        onPress={() => push({ pathname: `/(drawer)/[account]/swap`, params: { account } })}
      >
        Swap
      </Button>
    </View>
  );
}

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
