import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import useAsyncEffect from 'use-async-effect';
import { atom, SetterOrUpdater, useRecoilState } from 'recoil';

import { CombinedSafe, useSafes } from '~/queries';
import { ChildrenProps } from '@util/children';
import { Address } from 'lib';
import { Suspend } from '@components/Suspender';
import { persistAtom } from '@util/persistAtom';
import { useCreateCounterfactualSafe2 } from './useCreateCounterfactualSafe';

interface SafeContext {
  safe: CombinedSafe;
  select: SetterOrUpdater<Address>;
  createSafe: () => Promise<void>;
}

const Context = createContext<SafeContext | undefined>(undefined);

export const useSafesContext = () => useContext(Context)!;

export const useSafe = () => useSafesContext().safe;

export const useGroup = (id: string) =>
  useSafe().groups.find((g) => g.id === id);

const selectedSafeAddrState = atom<Address | undefined>({
  key: 'selectedSafeAddr',
  default: undefined,
  effects: [
    persistAtom({
      ignoreDefault: true,
    }),
  ],
});

export const SafeProvider = ({ children }: ChildrenProps) => {
  const { safes, loading } = useSafes();
  const createCfSafeMutation = useCreateCounterfactualSafe2();
  const [selectedAddr, setSelectedAddr] = useRecoilState(selectedSafeAddrState);

  const createSafe = useCallback(
    async () => setSelectedAddr(await createCfSafeMutation()),
    [createCfSafeMutation, setSelectedAddr],
  );

  const initializing = useRef(false);
  useAsyncEffect(async () => {
    if (!loading && !safes?.length) {
      initializing.current = true;

      await createSafe();

      initializing.current = false;
    }
  }, [safes, loading, initializing]);

  const selected = useMemo(
    () => safes.find((s) => s.safe.address === selectedAddr),
    [safes, selectedAddr],
  );

  // Change selection to an available safe if the selection isn't available
  useEffect(() => {
    if (!loading && safes?.length && !selected)
      setSelectedAddr(safes[0].safe.address);
  }, [loading, safes, selected, setSelectedAddr]);

  const value: SafeContext = useMemo(
    () => ({
      safe: selected,
      select: setSelectedAddr,
      createSafe,
    }),
    [createSafe, selected, setSelectedAddr],
  );

  if (!selected) return <Suspend />;

  return <Context.Provider value={value}>{children}</Context.Provider>;
};
