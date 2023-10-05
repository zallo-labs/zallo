import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { Fab } from '~/components/Fab';
import { LINKINGS_FROM_DEVICE } from '~/screens/confirm-link/ConfirmLinkSheet';
import { useEffect } from 'react';
import { Image } from 'expo-image';

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
      icon={(props) => <Image {...props} source={require('assets/ledger-icon.svg')} />}
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
