import SignClient from '@walletconnect/sign-client';
import Connector from '@walletconnect/client';

export interface WcSessionV1 {
  client: Connector; uri: string
} 

export interface WcSessionV2 {
  client: SignClient;
}

export type WcSession = WcSessionV1 | WcSessionV2;

export const isWcSessionV1 = (s: WcSession): s is WcSessionV1 => s.client.version === 1;
