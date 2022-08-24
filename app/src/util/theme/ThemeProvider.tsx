import { ReactNode } from 'react';
import { ThemeProvider as PaperProvider } from 'react-native-paper';
import { ThemeProvider as StyledComponentsProvider } from 'styled-components/native';
import { PAPER_THEME } from './paper';
import { STYLED_COMPONENTS_THEME } from './styledComponents';

export interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => (
  <PaperProvider theme={PAPER_THEME}>
    <StyledComponentsProvider theme={STYLED_COMPONENTS_THEME}>
      {children}
    </StyledComponentsProvider>
  </PaperProvider>
);
