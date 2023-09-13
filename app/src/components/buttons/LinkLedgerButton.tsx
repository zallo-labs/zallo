import { useNavigation } from '@react-navigation/native';
import { LedgerIcon } from '@theme/icons';
import { StyleSheet } from 'react-native';
import { Fab } from './Fab';
import { LINKINGS_FROM_DEVICE } from '~/screens/confirm-link/ConfirmLinkSheet';
import { useEffect } from 'react';

export interface LinkLedgerButtonProps {
  onLink?: () => void;
}

export function LinkLedgerButton({ onLink }: LinkLedgerButtonProps) {
  const { navigate } = useNavigation();

  useEffect(() => {
    const sub = LINKINGS_FROM_DEVICE.subscribe({ next: () => onLink?.() });
    return () => {
      if (!sub.closed) sub.unsubscribe();
    };
  }, [onLink]);

  return (
    <Fab
      position="relative"
      icon={(props) => <LedgerIcon {...props} color={styles.icon.color} />}
      style={styles.container}
      onPress={() => navigate('LinkLedger')}
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
