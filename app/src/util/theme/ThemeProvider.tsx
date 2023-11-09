import { ReactNode } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { PAPER_THEME } from './paper';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { NAVIGATION_THEME } from '@theme/navigation';
import { UnistylesTheme } from 'react-native-unistyles';

export interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <PaperProvider theme={PAPER_THEME}>
      <NavigationThemeProvider value={NAVIGATION_THEME}>
        <UnistylesTheme theme={PAPER_THEME}>{children}</UnistylesTheme>
      </NavigationThemeProvider>
    </PaperProvider>
  );
}
