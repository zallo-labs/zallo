import { mergeMap, tap } from 'rxjs';
import { Exchange, Operation, OperationResult } from './layer';
import { CacheConfig } from 'relay-runtime';

export interface AuthExchangeOptions {
  getAuthHeaders: (op?: Operation, requestHeaders?: Headers) => Record<string, string>;
  willAuthError?: (op: Operation) => boolean;
  didAuthError?: (result: OperationResult) => boolean;
  refreshToken?: () => void | Promise<void>;
}

export function authExchange({
  getAuthHeaders,
  willAuthError,
  didAuthError = (r) => r.response?.status === 401,
  refreshToken,
}: AuthExchangeOptions): Exchange {
  return ({ forward }) =>
    (operations$) => {
      const results = operations$.pipe(
        mergeMap(async (op) => {
          if (willAuthError?.(op)) await refreshToken?.();

          op.fetchOptions.headers = {
            ...op.fetchOptions.headers,
            ...getAuthHeaders(op, extractHeaders(op)),
          };

          return op;
        }),
        forward,
      );

      return results.pipe(
        tap((op) => {
          if (didAuthError?.(op)) refreshToken?.();
        }),
      );
    };
}

const AUTH_HEADERS_KEY = '__headers';

export type Headers = Record<string, string>;
export function withHeaders(headers: Headers, c?: CacheConfig): CacheConfig {
  return {
    ...c,
    metadata: {
      ...c?.metadata,
      [AUTH_HEADERS_KEY]: headers,
    },
  };
}

function extractHeaders(op: Operation | undefined) {
  return op?.cacheConfig.metadata?.[AUTH_HEADERS_KEY] as Headers | undefined;
}
