import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { WcEventParams } from '~/util/walletconnect/methods';

export interface SessionSignScreenParams {
  request: WcEventParams['session_request'];
}

export type SessionSignScreenProps = RootNavigatorScreenProps<'SessionSign'>;

export const SessionSignScreen = (props: SessionSignScreenProps) => {
  return null;
};
