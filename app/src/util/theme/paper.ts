import { DarkTheme as PaperDarkTheme } from 'react-native-paper';
import Color from 'color';
import {
  StyledComponentsTheme,
  STYLED_COMPONENTS_THEME,
} from './styledComponents';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNativePaper {
    interface ThemeColors {
      // primary
      onPrimary: string;
      primaryContainer: string;
      onPrimaryContainer: string;
      // accent
      onAccent: string;
      accentContainer: string;
      onAccentContainer: string;

      // background
      onBackground: string;
      // surface
      onSurface: string;
      opaqueSurface: string;
      outline: string;

      success: string;
      info: string;
      warning: string;
      delete: string;
      lighterText: string;
    }

    interface Theme extends StyledComponentsTheme {
      iconSize: {
        small: number;
        medium: number;
      };
    }
  }
}

// https://github.com/callstack/react-native-paper/blob/main/src/styles/themes/v3/DarkTheme.tsx
// https://akveo.github.io/react-native-ui-kitten/docs/design-system/eva-dark-theme
const surface = '#2b324d';
const onBackground = '#e9e2d9';

/* Notes
 * Placeholder color is replaced with onSurfaceVariant
 */

export const PAPER_THEME: ReactNativePaper.Theme = {
  ...PaperDarkTheme,
  ...STYLED_COMPONENTS_THEME,
  colors: {
    ...PaperDarkTheme.colors,

    primary: '#f3c00b', // yellow
    onPrimary: '#3e2e00',
    primaryContainer: '#5a4400',
    onPrimaryContainer: '#ffdf8b',

    accent: '#ffb0c9', // maroony pink
    onAccent: '#5e1032',
    accentContainer: '#7b2848',
    onAccentContainer: '#ffd8e3',

    background: '#151A30', // Dark blue/grey
    onBackground,
    surface,
    onSurface: onBackground,
    opaqueSurface: new Color(surface).alpha(0.8).string(),
    outline: '#989080',

    success: '#48C12A', // Green
    info: '#559EFC', // Blue
    warning: '#FFAF30', // Orange
    error: '#FF3D71', // Red/Pink
    delete: '#DD2C00', // Red
    lighterText: new Color(PaperDarkTheme.colors.text).alpha(0.7).hexa(),
  },

  iconSize: {
    small: 24,
    medium: 40,
  },
};
