import { DefaultTheme as NavTheme } from '@react-navigation/native';
import { LIGHT_THEME } from './paper';

export const NAVIGATION_THEME = {
  ...NavTheme,
  ...LIGHT_THEME,
  colors: {
    ...NavTheme.colors,
    ...LIGHT_THEME.colors,
    background: 'transparent',
  },
};
