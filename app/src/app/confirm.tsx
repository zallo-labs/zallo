import { useRouter } from 'expo-router';
import { Dialog, Text } from 'react-native-paper';
import { Subject } from 'rxjs';
import { z } from 'zod';

import { Button } from '~/components/Button';
import { DialogActions } from '~/components/Dialog/DialogActions';
import { DialogModal } from '~/components/Dialog/DialogModal';
import { useLocalParams } from '~/hooks/useLocalParams';
import { createStyles, useStyles } from '~/util/theme/styles';

export const CONFIRMATIONS = new Subject<true>();

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
  const router = useRouter();

  return (
    <DialogModal>
      {title && <Dialog.Title>{title}</Dialog.Title>}

      {message && (
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
      )}

      <DialogActions>
        <Button textColor={styles.cancel.color} onPress={router.back}>
          Cancel
        </Button>

        <Button
          textColor={styles[type].color}
          onPress={() => {
            CONFIRMATIONS.next(true);
          }}
        >
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
