import { Alert } from 'react-native';

export interface ConfirmDeleteOptions {
  message?: string;
  onDelete: () => void;
}

export const confirmDelete = ({ message, onDelete }: ConfirmDeleteOptions) =>
  Alert.alert(
    'Delete',
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: onDelete,
      },
    ],
    {
      cancelable: true,
    },
  );
