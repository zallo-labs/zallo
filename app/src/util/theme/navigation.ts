import { DefaultTheme as NavTheme } from '@react-navigation/native';
import { PAPER_THEME } from './paper';

export const NAVIGATION_THEME = {
  ...NavTheme,
  ...PAPER_THEME,
  colors: {
    ...NavTheme.colors,
    ...PAPER_THEME.colors,
  },
};
