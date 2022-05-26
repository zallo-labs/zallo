import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import useAsyncEffect from 'use-async-effect';
import { atom, useRecoilState } from 'recoil';

import { useCreateCfSafe } from '@mutations';
import { CombinedSafe, useSafes } from '@queries';
import { ChildrenProps } from '@util/children';
import { Address } from 'lib';
import { Suspend } from '@components/Suspender';

const SafeContext = createContext<CombinedSafe | undefined>(undefined);

export const useSafe = () => useContext(SafeContext)!;

export const useGroup = (id: string) =>
  useSafe().groups.find((g) => g.id === id);

const selectedSafeAddrState = atom<Address | undefined>({
  key: 'selectedSafeAddr',
  default: undefined,
});

export const SafeProvider = ({ children }: ChildrenProps) => {
  const { safes, loading, refetch } = useSafes();
  const createCfSafe = useCreateCfSafe();
  const [selectedAddr, setSelectedAddr] = useRecoilState(selectedSafeAddrState);

  const initializing = useRef(false);
  useAsyncEffect(async () => {
    if (!safes?.length && !loading) {
      initializing.current = true;

      await createCfSafe();
      refetch();

      initializing.current = false;
    }
  }, [safes, loading, initializing, createCfSafe, refetch]);

  const selected = useMemo(
    () => safes.find((s) => s.safe.address === selectedAddr),
    [safes, selectedAddr],
  );

  useEffect(() => {
    // Select a safe
    if (!loading && safes?.length && !selected) {
      const picked = safes.findIndex((s) =>
        s.safe.address.startsWith('0xC888'),
      );
      setSelectedAddr(safes[picked >= 0 ? picked : 0].safe.address);
    }
  }, [safes, loading, selected, setSelectedAddr]);

  if (!selected) return <Suspend />;

  return (
    <SafeContext.Provider value={selected}>{children}</SafeContext.Provider>
  );
};
