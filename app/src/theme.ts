import { DarkTheme as PaperDarkTheme } from 'react-native-paper';
import { DarkTheme as NavDarkTheme } from '@react-navigation/native';
import Color from 'color';

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

      onBackground: string;
      onSurface: string;

      success: string;
      info: string;
      warning: string;
      danger: string;
      lighterText: string;
    }

    interface Theme {
      radius: number;
    }
  }
}

const onColor = (color: string) => new Color(color).negate().hex();

// https://github.com/callstack/react-native-paper/blob/main/src/styles/DarkTheme.tsx
// https://akveo.github.io/react-native-ui-kitten/docs/design-system/eva-dark-theme
const background = '#151A30'; // Dark blue/grey
const surface = '#151A30'; // Dark blue
export const PAPER_THEME: ReactNativePaper.Theme = {
  ...PaperDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,

    primary: '#F3C00C', // yellow
    onPrimary: '#3E2E00',
    primaryContainer: '#594400',
    onPrimaryContainer: '#FFDF8B',

    accent: '#FFB0C7', // maroony pink
    onAccent: '#5E1130',
    accentContainer: '#7B2846',
    onAccentContainer: '#FFD9E2',

    background,
    onBackground: onColor(background),
    surface,
    onSurface: onColor(surface),

    success: '#48C12A', // Green
    info: '#559EFC', // Blue
    warning: '#FFAF30', // Orange
    danger: '#FF4128', // Red
    lighterText: new Color(PaperDarkTheme.colors.text).alpha(0.7).hexa(),
  },
  radius: PaperDarkTheme.roundness * 5,
};

export const NAV_THEME = {
  ...NavDarkTheme,
  ...PAPER_THEME,
  colors: {
    ...NavDarkTheme.colors,
    ...PAPER_THEME.colors,
  },
};
