import { SignClient } from '@walletconnect/sign-client/dist/types/client';
import Connector from '@walletconnect/client';

export type WcClient = SignClient | Connector;

export const isClientV2 = (client: WcClient): client is SignClient => client.version === 2;
