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

export interface ConfirmModalProps extends ConfirmModalParams {
  onDismiss?: () => void;
  onConfirmation?: (confirmed: boolean) => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  type,
  onDismiss,
  onConfirmation = (confirmed) => CONFIRMATIONS.next(confirmed),
}: ConfirmModalProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <DialogModal onDismiss={onDismiss}>
      {title && <Dialog.Title>{title}</Dialog.Title>}

      {message && (
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
      )}

      <DialogActions>
        <Button textColor={styles.cancel.color} onPress={() => onConfirmation(false)}>
          Cancel
        </Button>

        <Button textColor={styles[type].color} onPress={() => onConfirmation(true)}>
          {confirmLabel || 'Ok'}
        </Button>
      </DialogActions>
    </DialogModal>
  );
}

export default function ConfirmModalScreen() {
  const params = useLocalParams(ConfirmModalParams);
  return <ConfirmModal {...params} />;
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
