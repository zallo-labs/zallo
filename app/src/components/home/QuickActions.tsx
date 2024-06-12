import { QrCodeIcon, TransferIcon, SwapIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { UAddress } from 'lib';
import { useRouter } from 'expo-router';
import { useTransfer } from '~/hooks/useTransfer';
import { Button } from '../Button';
import { memo } from 'react';

export interface QuickActionsProps {
  account: UAddress;
}

function QuickActions_({ account }: QuickActionsProps) {
  const { push } = useRouter();
  const transfer = useTransfer();

  return (
    <View style={styles.container}>
      <Button
        icon={TransferIcon}
        mode="contained-tonal"
        style={styles.button}
        loading={false}
        onPress={() => transfer({ account })}
      >
        Transfer
      </Button>

      <Button
        icon={QrCodeIcon}
        mode="contained-tonal"
        style={styles.button}
        loading={false}
        onPress={() => push({ pathname: `/(modal)/[account]/receive`, params: { account } })}
      >
        Receive
      </Button>

      <Button
        icon={SwapIcon}
        mode="contained-tonal"
        style={styles.button}
        loading={false}
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

export const QuickActions = memo(QuickActions_);
