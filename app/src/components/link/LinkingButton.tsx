import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { LINKINGS_FROM_TOKEN } from '~/app/link';
import { Fab } from '~/components/Fab';
import { showSuccess } from '~/components/provider/SnackbarProvider';
import { QrCodeIcon } from '~/util/theme/icons';

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
