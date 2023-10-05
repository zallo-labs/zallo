import { useEffect, useMemo, useRef, useState } from 'react';

type InferArgs<T> = T extends (...t: [...infer Arg]) => any ? Arg : never;
type InferReturn<T> = T extends (...t: [...infer Arg]) => infer Res ? Res : never;

export function useWithLoading<F extends (...params: any[]) => any>(f: F | undefined) {
  const [loading, setLoading] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = useMemo(
    () =>
      f
        ? async (...params: InferArgs<F>): Promise<InferReturn<F>> => {
            const r = f(...params);

            const isPromise = r instanceof Promise;
            if (isPromise) setLoading(true);

            await r;

            if (isPromise && isMounted.current) setLoading(false);

            return r;
          }
        : undefined,
    [f],
  );

  return [loading, execute] as const;
}
