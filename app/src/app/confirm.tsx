import { useLocalSearchParams, useRouter } from 'expo-router';
import { Dialog, Text } from 'react-native-paper';
import { Button } from '~/components/Button';
import { DialogModal } from '~/components/Dialog/DialogModal';
import { Subject } from 'rxjs';
import { DialogActions } from '~/components/Dialog/DialogActions';
import { createStyles, useStyles } from '@theme/styles';

export const CONFIRMATIONS = new Subject<true>();

export type ConfirmModalRoute = `/confirm`;
export type ConfirmModalParams = {
  title?: string;
  message?: string;
  confirmLabel?: string;
  confirmTextColor?: string;
};

export default function ConfirmModal() {
  const { title, message, confirmLabel, confirmTextColor } =
    useLocalSearchParams<ConfirmModalParams>();
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
          textColor={confirmTextColor || styles.confirm.color}
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
  confirm: {
    color: colors.primary,
  },
}));
