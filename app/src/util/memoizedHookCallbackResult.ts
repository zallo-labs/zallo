import { useMemo } from 'react';

export const memoizedHookCallbackResult =
  <T extends () => (...args: any[]) => any>(hook: T) =>
  (...args: Parameters<ReturnType<T>>): ReturnType<ReturnType<T>> => {
    const f = hook();

    return useMemo(() => f(...args), [f, args]);
  };
