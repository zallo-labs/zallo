import { ReactNode } from 'react';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { UnistylesTheme } from 'react-native-unistyles';

import { NAVIGATION_THEME } from '~/util/theme/navigation';
import { PAPER_THEME } from './paper';

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
