import { mergeMap, tap } from 'rxjs';
import { Exchange, Operation, OperationResult } from './layer';

export interface AuthExchangeOptions {
  getAuthHeaders: () => Record<string, string>;
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
            ...getAuthHeaders(),
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
