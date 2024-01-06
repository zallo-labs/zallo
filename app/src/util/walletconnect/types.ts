import { formatJsonRpcError, formatJsonRpcResult } from '@walletconnect/jsonrpc-utils';
import { getSdkError } from '@walletconnect/utils';

export const asWalletConnectResult = formatJsonRpcResult;

export type WalletConnectErrorKey = Parameters<typeof getSdkError>[0];
export const asWalletConnectError = (id: number, errorKey: WalletConnectErrorKey) =>
  formatJsonRpcError(id, getSdkError(errorKey));
