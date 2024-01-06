import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { LINKINGS_FROM_DEVICE } from '~/app/link/token';
import { Fab } from '~/components/Fab';
import { __WEB__ } from '~/util/config';
import { LedgerIcon } from '~/util/theme/icons';

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

  if (__WEB__) return null;

  return (
    <Fab
      position="relative"
      icon={LedgerIcon}
      style={styles.container}
      onPress={() => router.push(`/ledger/link`)}
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
