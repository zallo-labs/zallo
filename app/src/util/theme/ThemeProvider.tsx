import { ThemeProvider as PaperProvider } from 'react-native-paper';
import { ChildrenProps } from '@util/children';
import { ThemeProvider as StyledComponentsProvider } from 'styled-components/native';
import { PAPER_THEME } from './paper';
import { STYLED_COMPONENTS_THEME } from './styledComponents';

export const ThemeProvider = ({ children }: ChildrenProps) => (
  <PaperProvider theme={PAPER_THEME}>
    <StyledComponentsProvider theme={STYLED_COMPONENTS_THEME}>
      {children}
    </StyledComponentsProvider>
  </PaperProvider>
);
