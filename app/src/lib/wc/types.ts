import { getSdkError } from '@walletconnect/utils';
import { formatJsonRpcResult, formatJsonRpcError } from '@walletconnect/jsonrpc-utils';

export const asWalletConnectResult = formatJsonRpcResult;

export type WalletConnectErrorKey = Parameters<typeof getSdkError>[0];
export const asWalletConnectError = (id: number, errorKey: WalletConnectErrorKey) =>
  formatJsonRpcError(id, getSdkError(errorKey));
