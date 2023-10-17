import { useState } from 'react';
import { Observable } from 'rxjs';
import useAsyncEffect from 'use-async-effect';

export function useObservable<T>(observable: Observable<T> | null) {
  const [state, setState] = useState<T | undefined>(undefined);

  useAsyncEffect(
    async (isMounted) => {
      if (!observable) return;

      const sub = observable.subscribe((value) => {
        if (isMounted()) setState(value);
      });

      return () => {
        sub.unsubscribe();
      };
    },
    (destroy) => destroy?.(),
    [observable],
  );

  return state;
}
