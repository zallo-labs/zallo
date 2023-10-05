import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Fab } from '~/components/Fab';
import { LINKINGS_FROM_DEVICE } from '~/screens/confirm-link/ConfirmLinkSheet';
import { LedgerIcon } from '@theme/icons';

export interface LinkLedgerButtonProps {
  onLink?: () => void;
}

export function LinkLedgerButton({ onLink }: LinkLedgerButtonProps) {
  const router = useRouter();

  useEffect(() => {
    const sub = LINKINGS_FROM_DEVICE.subscribe({ next: () => onLink?.() });
    return () => {
      if (!sub.closed) sub.unsubscribe();
    };
  }, [onLink]);

  return (
    <Fab
      position="relative"
      icon={LedgerIcon}
      style={styles.container}
      onPress={() => router.push('/link/ledger')}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  icon: {
    color: 'black',
  },
});
