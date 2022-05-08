import { createContext, useContext, useMemo, useRef } from 'react';
import useAsyncEffect from 'use-async-effect';

import { useCreateCfSafe } from '@mutations';
import { SafeData, useSafes } from '@queries';
import { ChildrenProps } from '@util/children';

const SafeContext = createContext<SafeData | undefined>(undefined);

export const useSafe = () => useContext(SafeContext)!;

export const useGroup = (id: string) =>
  useSafe().groups.find((g) => g.id === id);

const select = (safes?: SafeData[]): number | undefined => {
  if (!safes?.length) return undefined;

  return safes.length - 1;
};

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

  const selected = useMemo(() => select(safes), [safes]);

  if (!safes?.length || selected === undefined) return null;

  return (
    <SafeContext.Provider value={safes[selected]}>
      {children}
    </SafeContext.Provider>
  );
};
