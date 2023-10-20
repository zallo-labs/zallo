import { Dialog, DialogProps } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { makeStyles } from '@theme/makeStyles';

export interface DialogModalProps extends Omit<DialogProps, 'visible' | 'onDismiss'> {}

export function DialogModal(props: DialogModalProps) {
  const styles = useStyles();

  return (
    <Dialog visible onDismiss={useRouter().back} {...props} style={[styles.dialog, props.style]} />
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
