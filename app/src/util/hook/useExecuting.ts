import { useCallback, useState } from 'react';

export const useExecuting = <Func extends (params: Params) => R, Params, R>(f: Func) => {
  const [executing, setExecuting] = useState(false);

  const execute = useCallback(
    async (params: Params) => {
      setExecuting(true);
      const r = await f(params);
      setExecuting(false);

      return r;
    },
    [f],
  );

  return [execute, executing] as const;
};
