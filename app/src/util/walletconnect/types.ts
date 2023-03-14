import { SignClient } from '@walletconnect/sign-client';
import { SignClientTypes, SessionTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import { formatJsonRpcResult, formatJsonRpcError } from '@walletconnect/jsonrpc-utils';

export type WalletConnectClient = typeof SignClient;
export type WalletConnectEvent = SignClientTypes.Event;
export type WalletConnectEventArgs = SignClientTypes.EventArguments;
export type WalletConnectPeer = SignClientTypes.Metadata;
export type WalletConnectSession = SessionTypes.Struct;

export const asWalletConnectResult = formatJsonRpcResult;

export type WalletConnectErrorKey = Parameters<typeof getSdkError>[0];
export const asWalletConnectError = (id: number, errorKey: WalletConnectErrorKey) =>
  formatJsonRpcError(id, getSdkError(errorKey));
