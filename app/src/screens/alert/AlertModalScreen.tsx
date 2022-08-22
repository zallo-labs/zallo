import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { AlertModal, AlertModalProps } from './AlertModal';

export interface AlertModalScreenParams extends AlertModalProps {}

export type AlertModalScreenProps = RootNavigatorScreenProps<'Alert'>;

export const AlertModalScreen = ({ route }: AlertModalScreenProps) => (
  <AlertModal {...route.params} />
);
