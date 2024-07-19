import { retry, timer } from 'rxjs';
import { Exchange } from './layer';

export interface RetryExchangeOptions {
  maxAttempts?: number;
  delay?: (attempt: number) => number;
}

export function retryExchange({
  maxAttempts = 3,
  delay = exponentialBackoffDelayWithJitter,
}: RetryExchangeOptions = {}): Exchange {
  return ({ forward }) =>
    (operations$) =>
      operations$.pipe(
        forward,
        retry({
          delay: (_err, retries) => timer(delay(retries)),
          count: maxAttempts,
        }),
      );
}

export function exponentialBackoffDelayWithJitter(retries: number) {
  return 200 * 2 ** retries + Math.random() * 1000;
}
