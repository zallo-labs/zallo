import { Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Observable, firstValueFrom } from 'rxjs';

export function useGetEvent() {
  const router = useRouter();

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(
    async <T, R>(
      route: Href<R>,
      observable: Observable<T>,
      withObservable?: (obs: Observable<T>) => Observable<T>,
    ) => {
      const p = withObservable
        ? firstValueFrom(withObservable(observable))
        : firstValueFrom(observable);

      router.push(route);

      await p;

      if (isMounted) router.back();

      return p;
    },
    [router.push, router.back],
  );
}
