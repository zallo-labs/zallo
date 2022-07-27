import { MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';
import Color from 'color';
import {
  StyledComponentsTheme,
  STYLED_COMPONENTS_THEME,
} from './styledComponents';

// declare global {
//   interface Theme extends StyledComponentsTheme {
//     iconSize: {
//       small: number;
//       medium: number;
//     };

//     iconButton: {
//       size: number;
//       containerSize: number;
//     };
//   }
// }

// https://github.com/callstack/react-native-paper/blob/main/src/styles/themes/v3/DarkTheme.tsx
export const PAPER_THEME = {
  ...PaperDarkTheme,
  ...STYLED_COMPONENTS_THEME,
  colors: {
    ...PaperDarkTheme.colors,

    success: '#48C12A', // Green
    info: '#559EFC', // Blue
    warning: '#FFAF30', // Orange
    // lighterText: new Color(PaperDarkTheme.colors.onSurface).alpha(0.7).hexa(),
  },

  iconSize: {
    small: 24,
    medium: 40,
  },
  iconButton: {
    size: 24,
    containerSize: 40,
  },
};

export type ThemeOverride = typeof PAPER_THEME;
