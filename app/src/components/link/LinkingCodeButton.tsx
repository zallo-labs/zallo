import { useNavigation } from '@react-navigation/native';
import { QrCodeIcon } from '@theme/icons';
import { StyleSheet } from 'react-native';
import { Fab } from '~/components/Fab';
import { useEffect } from 'react';
import { showSuccess } from '~/provider/SnackbarProvider';
import { LINKINGS_FROM_TOKEN } from '~/screens/linking-token/LinkingTokenModal';

export interface LinkingCodeButtonProps {
  onLink?: () => void;
}

export function LinkingCodeButton({ onLink }: LinkingCodeButtonProps) {
  const { navigate } = useNavigation();

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
      onPress={() => navigate('LinkingTokenModal', {})}
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
