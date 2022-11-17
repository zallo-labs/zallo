import { getSdkError } from '@walletconnect/utils';
import { formatJsonRpcResult, formatJsonRpcError } from '@walletconnect/jsonrpc-utils';

export const toWcResult = formatJsonRpcResult;

export type WcErrorKey = Parameters<typeof getSdkError>[0];

export const toWcError = (id: number, errorKey: WcErrorKey) =>
  formatJsonRpcError(id, getSdkError(errorKey));
