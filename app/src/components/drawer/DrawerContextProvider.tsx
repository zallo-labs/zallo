import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useMemo } from 'react';

const CONTEXT = createContext<DrawerContext | undefined>(undefined);

export function useMaybeDrawerContext() {
  return useContext(CONTEXT);
}

export function useDrawerContext() {
  const context = useContext(CONTEXT);
  if (!context) throw new Error('Drawer context not found');
  return context;
}

export type DrawerType = 'standard' | 'modal';

export interface DrawerContext {
  type: DrawerType;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface DrawerContextProviderProps extends DrawerContext {
  children: ReactNode;
}

export function DrawerContextProvider({ children, ...context }: DrawerContextProviderProps) {
  return <CONTEXT.Provider value={context}>{children}</CONTEXT.Provider>;
}

export function useDrawerActions() {
  const set = useDrawerContext().setOpen;

  return useMemo(
    () => ({
      toggle: () => set((open) => !open),
      open: () => set(true),
      close: () => set(false),
    }),
    [set],
  );
}
