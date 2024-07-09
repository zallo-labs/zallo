import { tap } from 'rxjs/operators';
import { Exchange, Operation, OperationResult } from './layer';
import { OperationError } from './OperationError';

type ResultWithGraphQLError = Omit<OperationResult, 'errors'> &
  Required<Pick<OperationResult, 'errors'>>;

export interface MapExchangeOptions {
  onRequest?: (op: Operation) => void;
  onResponse?: (result: OperationResult) => void;
  onNetworkError?: (error: Error | OperationError) => void;
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
        tap((op) => {
          onRequest?.(op);
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
