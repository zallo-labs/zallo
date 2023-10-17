import { ReactNode } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { PAPER_THEME } from './paper';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { NAVIGATION_THEME } from '@theme/navigation';

export interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <PaperProvider theme={PAPER_THEME}>
      <NavigationThemeProvider value={NAVIGATION_THEME}>{children}</NavigationThemeProvider>
    </PaperProvider>
  );
}
