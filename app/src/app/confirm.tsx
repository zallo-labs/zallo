import { useLocalSearchParams, useRouter } from 'expo-router';
import { makeStyles } from '@theme/makeStyles';
import { Dialog, Text } from 'react-native-paper';
import { Button } from '~/components/Button';
import { DialogRoot } from '~/components/DialogRoot';
import { Subject } from 'rxjs';

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
  const styles = useStyles();
  const router = useRouter();

  return (
    <DialogRoot>
      {title && <Dialog.Title>{title}</Dialog.Title>}

      {message && (
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
      )}

      <Dialog.Actions>
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
      </Dialog.Actions>
    </DialogRoot>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  cancel: {
    color: colors.onSurfaceVariant,
  },
  confirm: {
    color: colors.primary,
  },
}));
