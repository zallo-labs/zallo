import { useStyles } from '@theme/styles';
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useMemo } from 'react';
import { UnistylesBreakpoints } from 'react-native-unistyles';
import { P, match } from 'ts-pattern';

const CONTEXT = createContext<DrawerContext | undefined>(undefined);

export function useDrawerContext() {
  const context = useContext(CONTEXT);
  if (!context) throw new Error('Drawer context not found');
  return context;
}

export type DrawerType = 'modal' | 'standard';
export type NavType = DrawerType | 'rail';

export function useNavType(): NavType {
  return getNavType(useStyles().breakpoint);
}

export function getNavType(breakpoint: keyof UnistylesBreakpoints): NavType {
  return match(breakpoint)
    .returnType<NavType>()
    .with('compact', () => 'modal')
    .with(P.union('medium', 'expanded', 'large'), () => 'rail')
    .otherwise(() => 'standard');
}

export function useDrawerType(): DrawerType {
  return useNavType() === 'standard' ? 'standard' : 'modal';
}

export interface DrawerContext {
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
