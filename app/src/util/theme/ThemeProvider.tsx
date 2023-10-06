import { ReactNode } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider as StyledComponentsProvider } from 'styled-components/native';
import { PAPER_THEME } from './paper';
import { STYLED_COMPONENTS_THEME } from './styledComponents';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { NAVIGATION_THEME } from '@theme/navigation';

export interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => (
  <PaperProvider theme={PAPER_THEME}>
    <StyledComponentsProvider theme={STYLED_COMPONENTS_THEME}>
      <NavigationThemeProvider value={NAVIGATION_THEME}>{children}</NavigationThemeProvider>
    </StyledComponentsProvider>
  </PaperProvider>
);
