import { QrCodeIcon } from '@theme/icons';
import { StyleSheet } from 'react-native';
import { Fab } from '~/components/Fab';
import { useEffect } from 'react';
import { showSuccess } from '~/components/provider/SnackbarProvider';
import { LINKINGS_FROM_TOKEN } from '~/app/link';
import { useRouter } from 'expo-router';

export interface LinkingButtonProps {
  onLink?: () => void;
}

export function LinkingButton({ onLink }: LinkingButtonProps) {
  const router = useRouter();

  useEffect(() => {
    const sub = LINKINGS_FROM_TOKEN.subscribe(() => {
      showSuccess('Linked');
      onLink?.();
    });

    return () => sub.unsubscribe();
  }, [onLink]);

  return (
    <Fab
      position="relative"
      icon={(props) => <QrCodeIcon {...props} color={styles.icon.color} />}
      onPress={() => router.push(`/link`)}
      style={styles.container}
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
