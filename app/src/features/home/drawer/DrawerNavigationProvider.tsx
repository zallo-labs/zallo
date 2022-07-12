import { createContext, ReactNode, useContext } from 'react';
import { HomeScreenProps } from '../HomeScreen';

export type DrawerNavigate = HomeScreenProps['navigation']['navigate'];

const context = createContext<DrawerNavigate>(() => {
  throw new Error('Drawer context not initialized');
});

export const useDrawerNavigation = () => useContext(context);

export interface DrawerNavigationProviderProps {
  children: ReactNode;
  navigate: DrawerNavigate;
}

export const DrawerNavigationProvider = ({
  children,
  navigate,
}: DrawerNavigationProviderProps) => (
  <context.Provider value={navigate}>{children}</context.Provider>
);
