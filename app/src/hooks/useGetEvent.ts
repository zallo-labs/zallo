import { Href, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Observable, firstValueFrom } from 'rxjs';

export function useGetEvent() {
  const router = useRouter();

  const controller = useRef<AbortController | undefined>();

  return useCallback(
    <T, R>(
      route: Href<R>,
      observable: Observable<T>,
      withObservable?: (obs: Observable<T>) => Observable<T>,
    ) =>
      new Promise<T | undefined>((resolve) => {
        controller.current?.abort(); // Abort any existing promises
        controller.current = new AbortController();

        let resolved = false;
        controller.current.signal.onabort = () => {
          if (!resolved) {
            resolved = true;
            resolve(undefined);
          }
        };

        const p = firstValueFrom(withObservable ? withObservable(observable) : observable);
        router.push(route);

        p.then((r) => {
          if (!resolved) {
            resolved = true;

            router.back();
            resolve(r);
          }
        });
      }),
    [router],
  );
}
