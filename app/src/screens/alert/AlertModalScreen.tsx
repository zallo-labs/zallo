import { useCallback } from 'react';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { AlertModal, AlertModalProps } from './AlertModal';

export interface AlertModalScreenParams extends AlertModalProps {}

export type AlertModalScreenProps = StackNavigatorScreenProps<'Alert'>;

export const AlertModalScreen = ({ route }: AlertModalScreenProps) => (
  <AlertModal {...route.params} />
);

export const useAlertConfirmation = (defaultParams?: Partial<AlertModalScreenParams>) => {
  const { navigate } = useRootNavigation();

  return useCallback(
    (params: AlertModalScreenParams) =>
      navigate('Alert', {
        ...defaultParams,
        ...params,
      }),
    [defaultParams, navigate],
  );
};
