import { createContext, useContext, useMemo, useRef } from 'react';
import useAsyncEffect from 'use-async-effect';

import { useCreateCfSafe } from '@mutations';
import { SafeData, useSafes } from '@queries';
import { ChildrenProps } from '@util/children';

const SafeContext = createContext<SafeData | undefined>(undefined);

export const useSafe = () => useContext(SafeContext)!;

const select = (safes: SafeData[]): number => 0;

export const SafeProvider = ({ children }: ChildrenProps) => {
  const { safes, loading, refetch } = useSafes();
  const createCfSafe = useCreateCfSafe();

  const initializing = useRef(false);
  useAsyncEffect(async () => {
    if (!safes && !loading) {
      initializing.current = true;

      console.log('Creating cf safe');
      await createCfSafe();
      refetch();

      initializing.current = false;
    }
  }, [safes, loading, initializing, createCfSafe, refetch]);

  const selected = useMemo(() => (safes ? select(safes) : undefined), [safes]);

  if (!safes || selected === undefined) return null;

  return (
    <SafeContext.Provider value={safes[selected]}>
      {children}
    </SafeContext.Provider>
  );
};
