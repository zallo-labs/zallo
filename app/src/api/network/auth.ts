import { mergeMap, tap } from 'rxjs';
import { Exchange, OperationRequest, OperationResult } from './layer';

export interface AuthExchangeOptions {
  getAuthHeaders: () => Record<string, string>;
  willAuthError?: (request: OperationRequest) => boolean;
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
    (requests$) => {
      const results = requests$.pipe(
        mergeMap(async (req) => {
          if (willAuthError?.(req)) await refreshToken?.();

          req.fetchOptions.headers = {
            ...req.fetchOptions.headers,
            ...getAuthHeaders(),
          };

          return req;
        }),
        forward,
      );

      return results.pipe(
        tap((result) => {
          if (didAuthError?.(result)) refreshToken?.();
        }),
      );
    };
}
