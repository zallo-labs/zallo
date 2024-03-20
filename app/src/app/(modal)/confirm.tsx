import { Dialog, Text } from 'react-native-paper';
import { Button } from '#/Button';
import { DialogModal } from '#/Dialog/DialogModal';
import { Subject } from 'rxjs';
import { DialogActions } from '#/Dialog/DialogActions';
import { createStyles, useStyles } from '@theme/styles';
import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';

export const CONFIRMATIONS = new Subject<boolean>();

const ConfirmModalParams = z.object({
  title: z.string().optional(),
  message: z.string().optional(),
  confirmLabel: z.string().optional(),
  type: z.enum(['action', 'warning', 'destructive']).default('action'),
});
export type ConfirmModalParams = z.infer<typeof ConfirmModalParams>;

export default function ConfirmModal() {
  const { title, message, confirmLabel, type } = useLocalParams(ConfirmModalParams);
  const { styles } = useStyles(stylesheet);

  return (
    <DialogModal>
      {title && <Dialog.Title>{title}</Dialog.Title>}

      {message && (
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
      )}

      <DialogActions>
        <Button textColor={styles.cancel.color} onPress={() => CONFIRMATIONS.next(false)}>
          Cancel
        </Button>

        <Button textColor={styles[type].color} onPress={() => CONFIRMATIONS.next(true)}>
          {confirmLabel || 'Ok'}
        </Button>
      </DialogActions>
    </DialogModal>
  );
}

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

export { ErrorBoundary } from '#/ErrorBoundary';