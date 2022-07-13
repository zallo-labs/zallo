import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useAsyncEffect from 'use-async-effect';
import { atom, SetterOrUpdater, useRecoilState } from 'recoil';

import { ChildrenProps } from '@util/children';
import { Address, Id } from 'lib';
import { Suspend } from '@components/Suspender';
import { persistAtom } from '@util/effect/persistAtom';
import { useCreateCounterfactualSafe } from './useCreateCounterfactualSafe';
import { CombinedSafe, useSafes } from '~/queries/useSafes';

interface SafeContext {
  safe: CombinedSafe;
  select: SetterOrUpdater<Address>;
  createSafe: () => Promise<void>;
}

const Context = createContext<SafeContext | undefined>(undefined);

export const useSafesContext = () => useContext(Context)!;

export const useSafe = () => useSafesContext().safe;

export const useGroup = (id?: Id) => useSafe().groups.find((g) => g.id === id);

const selectedSafeAddrState = atom<Address | undefined>({
  key: 'selectedSafeAddr',
  default: undefined,
  effects: [
    persistAtom({
      saveIf: (value) => value !== undefined,
    }),
  ],
});

export const SafeProvider = ({ children }: ChildrenProps) => {
  const { safes, loading } = useSafes();
  const createCfSafeMutation = useCreateCounterfactualSafe();
  const [selectedAddr, setSelectedAddr] = useRecoilState(selectedSafeAddrState);

  const createSafe = useCallback(
    async () => setSelectedAddr(await createCfSafeMutation()),
    [createCfSafeMutation, setSelectedAddr],
  );

  const [safeCreated, setSafeCreated] = useState(false);
  useAsyncEffect(async () => {
    if (!safeCreated && !loading && !safes?.length) {
      setSafeCreated(true);
      await createSafe();
    }
  }, [safes, loading, safeCreated]);

  const selected = useMemo(
    () => safes.find((s) => s.safe.address === selectedAddr),
    [safes, selectedAddr],
  );

  // Change selection to an available safe if the selection isn't available
  useEffect(() => {
    if (!loading && safes?.length && !selected)
      setSelectedAddr(safes[0].safe.address);
  }, [loading, safes, selected, setSelectedAddr]);

  const value = useMemo(
    () =>
      selected &&
      ({
        safe: selected,
        select: setSelectedAddr,
        createSafe,
      } as SafeContext),
    [createSafe, selected, setSelectedAddr],
  );

  if (!value) return <Suspend />;

  return <Context.Provider value={value}>{children}</Context.Provider>;
};
