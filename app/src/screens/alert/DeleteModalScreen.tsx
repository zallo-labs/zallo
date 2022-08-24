import { useTheme } from '@theme/paper';
import { useCallback } from 'react';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { AlertModal, AlertModalProps } from './AlertModal';

export interface DeleteModalScreenParams extends AlertModalProps {}

export type DeleteModalScreenProps = RootNavigatorScreenProps<'Delete'>;

export const DeleteModalScreen = ({ route }: DeleteModalScreenProps) => {
  const { colors } = useTheme();

  return (
    <AlertModal
      title="Delete"
      message="Are you sure you want to delete?"
      confirmLabel="Delete"
      confirmTextColor={colors.error}
      {...route.params}
    />
  );
};

export const useDeleteConfirmation = () => {
  const { navigate } = useRootNavigation();

  return useCallback(
    (params: DeleteModalScreenParams | DeleteModalScreenParams['onConfirm']) =>
      navigate(
        'Delete',
        typeof params === 'object'
          ? params
          : {
              onConfirm: params,
            },
      ),
    [navigate],
  );
};
