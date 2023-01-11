import { useTheme } from '@theme/paper';
import { Button, Dialog, Text } from 'react-native-paper';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { DialogRoot } from '~/components/DialogRoot';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';

export interface AlertScreenParams {
  title?: string;
  message?: string;
  onConfirm: () => unknown;
  confirmLabel?: string;
  confirmTextColor?: string;
}

export type AlertScreenProps = StackNavigatorScreenProps<'Alert'>;

export const AlertScreen = ({ route: { params } }: AlertScreenProps) => {
  const { title, message, onConfirm, confirmLabel, confirmTextColor } = params;
  const { colors } = useTheme();
  const { goBack } = useRootNavigation();

  return (
    <DialogRoot>
      {title && <Dialog.Title>{title}</Dialog.Title>}

      {message && (
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
      )}

      <Dialog.Actions>
        <Button textColor={colors.onSurfaceVariant} onPress={goBack}>
          Cancel
        </Button>

        <Button
          textColor={confirmTextColor || colors.primary}
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
