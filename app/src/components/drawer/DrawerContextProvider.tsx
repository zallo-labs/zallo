import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { ReactNode, createContext, useContext } from 'react';

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
}

export interface DrawerContextProviderProps extends DrawerContext {
  children: ReactNode;
}

export function DrawerContextProvider({ children, ...context }: DrawerContextProviderProps) {
  return <CONTEXT.Provider value={context}>{children}</CONTEXT.Provider>;
}

export function useDrawerActions() {
  const navigation = useNavigation();

  return {
    toggle: () => navigation.dispatch(DrawerActions.toggleDrawer()),
    open: () => navigation.dispatch(DrawerActions.openDrawer()),
    close: () => navigation.dispatch(DrawerActions.closeDrawer()),
  };
}
