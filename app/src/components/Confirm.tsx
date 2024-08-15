import { createCallable } from 'react-call';
import { Dialog, Text } from 'react-native-paper';
import { Button } from '#/Button';
import { DialogModal } from '#/Dialog/DialogModal';
import { DialogActions } from '#/Dialog/DialogActions';
import { createStyles, useStyles } from '@theme/styles';

type ConfirmType = 'action' | 'warning' | 'destructive';
export interface ConfirmProps {
  title?: string;
  message?: string;
  confirmLabel?: string;
  type?: 'action' | 'warning' | 'destructive';
}

export const Confirm = createCallable<ConfirmProps, boolean>(
  ({ call, type = 'action', ...props }) => {
    const { title, message, confirmLabel } = { ...DEFAULTS[type], ...props };
    const { styles } = useStyles(stylesheet);

    return (
      <DialogModal onDismiss={() => call.end(false)}>
        {title && <Dialog.Title>{title}</Dialog.Title>}

        {message && (
          <Dialog.Content>
            <Text variant="bodyMedium">{message}</Text>
          </Dialog.Content>
        )}

        <DialogActions>
          <Button textColor={styles.cancel.color} onPress={() => call.end(false)}>
            Cancel
          </Button>

          <Button textColor={styles[type].color} onPress={() => call.end(true)}>
            {confirmLabel || 'Ok'}
          </Button>
        </DialogActions>
      </DialogModal>
    );
  },
);

const stylesheet = createStyles(({ colors }) => ({
  cancel: {
    color: colors.onSurfaceVariant,
  },
  action: {
    color: colors.primary,
  },
  warning: {
    color: colors.warning,
  },
  destructive: {
    color: colors.error,
  },
}));

const DEFAULTS: Partial<Record<ConfirmType, Partial<ConfirmProps>>> = {
  destructive: {
    title: 'Remove?',
    message: 'Are you sure you want to remove?',
    confirmLabel: 'Remove',
  },
};
