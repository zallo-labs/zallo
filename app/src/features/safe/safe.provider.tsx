import { createContext, ReactNode, useContext, useRef, useState } from 'react';
import useAsyncEffect from 'use-async-effect';
import { useCreateCfSafe } from '@mutations';
import { SafeData, useSafes } from '@queries';

const SafeContext = createContext<SafeData | undefined>(undefined);

export const useSafe = () => useContext(SafeContext)!;

export interface SafeProviderProps {
  children: ReactNode;
}

export const SafeProvider = ({ children }: SafeProviderProps) => {
  const { safes } = useSafes();
  const createCfSafe = useCreateCfSafe();

  const [safe, setSafe] = useState<SafeData | undefined>(undefined);
  const initializing = useRef(false);
  useAsyncEffect(async () => {
    if (!safe && safes && !initializing.current) {
      initializing.current = true;

      setSafe(safes[0] ?? (await createCfSafe()).safe);

      initializing.current = false;
    }
  }, [safes, safe, setSafe, createCfSafe, initializing]);

  if (!safe) return null;

  return <SafeContext.Provider value={safe}>{children}</SafeContext.Provider>;
};
