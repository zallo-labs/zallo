import { createContext, useContext, useRef, useState } from 'react';
import useAsyncEffect from 'use-async-effect';

import { useCreateCfSafe } from '@mutations';
import { SafeData, useSafes } from '@queries';
import { ChildrenProps } from '@util/children';

const SafeContext = createContext<SafeData | undefined>(undefined);

export const useSafe = () => useContext(SafeContext)!;

export const SafeProvider = ({ children }: ChildrenProps) => {
  const { safes } = useSafes();
  const createCfSafe = useCreateCfSafe();

  const [data, setData] = useState<SafeData | undefined>(undefined);
  const initializing = useRef(false);
  useAsyncEffect(async () => {
    if (!data && safes && !initializing.current) {
      initializing.current = true;

      if (safes.length) {
        setData(safes[0]);
      } else {
        setData((await createCfSafe()).safe);
      }

      // setData(safes[0] ?? (await createCfSafe()).safe);

      initializing.current = false;
    }
  }, [safes, data, setData, createCfSafe, initializing]);

  if (!data) return null;

  return <SafeContext.Provider value={data}>{children}</SafeContext.Provider>;
};
