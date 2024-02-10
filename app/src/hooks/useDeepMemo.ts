import { useCallback, useMemo, useRef } from 'react';
import deepEqual from 'fast-deep-equal';

export function useDeepMemo<T>(factory: () => T, dependencies: React.DependencyList) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, useDeepCompareMemoize(dependencies));
}

// eslint-disable-next-line @typescript-eslint/ban-types -- useCallback expects Function
export function useDeepCallback<T extends Function>(
  callback: T,
  dependencies: React.DependencyList,
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, useDeepCompareMemoize(dependencies));
}

function useDeepCompareMemoize(dependencies: React.DependencyList) {
  const dependenciesRef = useRef<React.DependencyList>(dependencies);
  const signalRef = useRef<number>(0);

  if (!deepEqual(dependencies, dependenciesRef.current)) {
    dependenciesRef.current = dependencies;
    signalRef.current += 1;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => dependenciesRef.current, [signalRef.current]);
}
