import { makeStyles } from '@theme/makeStyles';
import { Dialog, Text } from 'react-native-paper';
import { Button } from '~/components/Button';
import { DialogRoot } from '~/components/DialogRoot';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { EventEmitter } from '~/util/EventEmitter';

const ALERT_EMITTER = new EventEmitter<true>('Alert');
export const useAlert = ALERT_EMITTER.createUseSelect('Alert');

export interface AlertModalParams {
  title?: string;
  message?: string;
  confirmLabel?: string;
  confirmTextColor?: string;
}

export type AlertModalProps = StackNavigatorScreenProps<'Alert'>;

export const AlertModal = ({ route, navigation: { goBack } }: AlertModalProps) => {
  const styles = useStyles();
  const { title, message, confirmLabel, confirmTextColor } = route.params;

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
            ALERT_EMITTER.emit(true);
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
