import { makeStyles } from '@theme/makeStyles';
import { Dialog, Text } from 'react-native-paper';
import { Button } from '~/components/Button';
import { DialogRoot } from '~/components/DialogRoot';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';

export interface AlertModalParams {
  title?: string;
  message?: string;
  onConfirm: () => unknown;
  confirmLabel?: string;
  confirmTextColor?: string;
}

export type AlertModalProps = StackNavigatorScreenProps<'Alert'>;

export const AlertModal = ({ route: { params }, navigation: { goBack } }: AlertModalProps) => {
  const styles = useStyles();
  const { title, message, onConfirm, confirmLabel, confirmTextColor } = params;

  return (
    <DialogRoot>
      {title && <Dialog.Title>{title}</Dialog.Title>}

      {message && (
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
      )}

      <Dialog.Actions>
        <Button textColor={styles.cancel.color} onPress={goBack}>
          Cancel
        </Button>

        <Button
          textColor={confirmTextColor || styles.confirm.color}
          onPress={async () => {
            await onConfirm();
            goBack();
          }}
        >
          {confirmLabel || 'Ok'}
        </Button>
      </Dialog.Actions>
    </DialogRoot>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  cancel: {
    color: colors.onSurfaceVariant,
  },
  confirm: {
    color: colors.primary,
  },
}));
