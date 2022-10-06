import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { WcEventParams } from '~/util/walletconnect/methods';

export interface SessionSendTransactionScreenParams {
  request: WcEventParams['session_request'];
}

export type SessionSendTransactionScreenProps =
  RootNavigatorScreenProps<'SessionSendTransaction'>;

export const SessionSendTransactionScreen = (
  props: SessionSendTransactionScreenProps,
) => {
  return null;
};
