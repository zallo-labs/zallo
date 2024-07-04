import { tap } from 'rxjs/operators';
import { Exchange, OperationRequest, OperationResult } from './layer';
import { OperationRequestError } from './OperationRequestError';

type ResultWithGraphQLError = Omit<OperationResult, 'errors'> &
  Required<Pick<OperationResult, 'errors'>>;

export interface MapExchangeOptions {
  onRequest?: (request: OperationRequest) => void;
  onResponse?: (result: OperationResult) => void;
  onNetworkError?: (error: Error | OperationRequestError) => void;
  onGraphQLError?: (result: ResultWithGraphQLError) => void;
}

export function mapExchange({
  onRequest,
  onResponse,
  onNetworkError,
  onGraphQLError,
}: MapExchangeOptions): Exchange {
  return ({ forward }) =>
    (requests$) =>
      requests$.pipe(
        tap((request) => {
          onRequest?.(request);
        }),
        forward,
        tap({
          next: (result) => {
            if (result.errors?.length) onGraphQLError?.(result as ResultWithGraphQLError);
            if (result.data) onResponse?.(result);
          },
          error: (error) => {
            onNetworkError?.(error);
          },
        }),
      );
}
