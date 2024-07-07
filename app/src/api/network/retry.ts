import { retry, timer } from 'rxjs';
import { Exchange } from './layer';

export interface RetryExchangeOptions {
  maxAttempts?: number;
  backoff?: (attempt: number) => number;
}

export function retryExchange({
  maxAttempts = 1,
  backoff = (n) => 200 * 2 ** n,
}: RetryExchangeOptions = {}): Exchange {
  return ({ forward }) =>
    (operations$) =>
      operations$.pipe(
        forward,
        retry({
          delay: (_err, attempt) => timer(backoff(attempt)),
          count: maxAttempts,
        }),
      );
}
