import { Dialog as InternalDialog, DialogProps as InternalDialogProps } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { makeStyles } from '@theme/makeStyles';

export interface DialogModalProps extends Omit<InternalDialogProps, 'visible' | 'onDismiss'> {}

export function DialogModal(props: DialogModalProps) {
  const styles = useStyles();

  return (
    <>
      <Stack.Screen options={{ presentation: 'transparentModal', headerShown: false }} />

      <InternalDialog
        visible
        onDismiss={useRouter().back}
        {...props}
        style={[styles.dialog, props.style]}
      />
    </>
  );
}

// https://m3.material.io/components/dialogs/specs
const useStyles = makeStyles(({ window }) => ({
  dialog: {
    alignSelf: 'center',
    minWidth: Math.min(window.width, 280),
    maxWidth: 560,
  },
}));
