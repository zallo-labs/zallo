import { Box } from '~/components/layout/Box';
import { useTheme } from '@theme/paper';
import { Button, Dialog, Text } from 'react-native-paper';
import { useRootNavigation } from '~/navigation/useRootNavigation';

export interface AlertModalProps {
  title?: string;
  message?: string;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmTextColor?: string;
}

export const AlertModal = ({
  title,
  message,
  onConfirm,
  confirmLabel,
  confirmTextColor,
}: AlertModalProps) => {
  const { colors } = useTheme();
  const { goBack } = useRootNavigation();

  return (
    <Box flex={1} vertical center>
      <Dialog visible onDismiss={goBack}>
        {title && <Dialog.Title>{title}</Dialog.Title>}

        {message && (
          <Dialog.Content>
            <Text variant="bodyMedium">{message}</Text>
          </Dialog.Content>
        )}

        <Dialog.Actions>
          <Button textColor={colors.secondary} onPress={goBack}>
            Cancel
          </Button>

          <Button
            textColor={confirmTextColor || colors.primary}
            onPress={() => {
              onConfirm();
              goBack();
            }}
          >
            {confirmLabel || 'Ok'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Box>
  );
};
