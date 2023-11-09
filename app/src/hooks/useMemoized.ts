import { useMemo } from 'react';

export function useMemoApply<const Params extends Record<string, unknown>, R>(
  f: (params: Params) => R,
  params: Params,
): R {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => f(params), Object.values(params));
}
