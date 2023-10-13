import { PrimitiveAtom } from 'jotai';
import { ReactNode, createContext, useContext } from 'react';

const CONTEXT = createContext<DrawerContext | undefined>(undefined);

export function useDrawerContext() {
  const context = useContext(CONTEXT);
  if (!context) throw new Error('Drawer context not found');
  return context;
}

export type DrawerType = 'standard' | 'modal';

export interface DrawerContext {
  openAtom: PrimitiveAtom<boolean>;
  toggle: () => void;
  type: DrawerType;
}

export interface DrawerContextProviderProps extends DrawerContext {
  children: ReactNode;
}

export function DrawerContextProvider({ children, ...context }: DrawerContextProviderProps) {
  return <CONTEXT.Provider value={context}>{children}</CONTEXT.Provider>;
}
