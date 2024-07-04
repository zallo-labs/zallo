import { delay, filter, map, merge, mergeMap, of, partition, tap, retry as rxRetry } from 'rxjs';
import { Exchange } from './layer';

export interface RetryExchangeOptions {
  maxAttempts?: number;
  backoff?: (attempt: number) => number;
}

export function retryExchange({
  maxAttempts = 3,
  backoff = (n) => 200 * 2 ** n,
}: RetryExchangeOptions = {}): Exchange {
  // const retry =
  //   (attempts: number): Exchange =>
  //   (input) =>
  //   (requests$) => {
  //     const { forward } = input;
  //     const results$ = requests$.pipe(forward);
  //     const [toRetry$, forward$] = partition(results$, (r) => !!r.error && attempts < maxAttempts);

  //     // requests$.pipe(forward, map(to error if failed), rxjsRetry());

  //     const retried$ = toRetry$.pipe(
  //       delay(backoff(attempts)),
  //       map((r) => r.request),
  //       retry(attempts + 1)(input),
  //     );

  //     return merge(forward$, retried$);
  //   };

  // return retry(0);

  return (input) => (requests$) => {
    const { forward } = input;

    return requests$.pipe(
      forward,
      rxRetry({
        count: maxAttempts,
        delay: 100, // TODO: use backoff
      }),
    );
  };
}
