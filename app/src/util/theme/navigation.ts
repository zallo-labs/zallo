import { DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { PAPER_THEME } from './paper';

export const NAVIGATION_THEME = {
  ...NavDarkTheme,
  ...PAPER_THEME,
  colors: {
    ...NavDarkTheme.colors,
    ...PAPER_THEME.colors,
  },
};
