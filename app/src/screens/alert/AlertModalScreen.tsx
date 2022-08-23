import { useCallback } from 'react';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { AlertModal, AlertModalProps } from './AlertModal';

export interface AlertModalScreenParams extends AlertModalProps {}

export type AlertModalScreenProps = RootNavigatorScreenProps<'Alert'>;

export const AlertModalScreen = ({ route }: AlertModalScreenProps) => (
  <AlertModal {...route.params} />
);

export const useAlertConfirmation = () => {
  const { navigate } = useRootNavigation();

  return useCallback(
    (params: AlertModalScreenParams) => navigate('Alert', params),
    [navigate],
  );
};
