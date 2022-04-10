import { DarkTheme as PaperDarkTheme } from 'react-native-paper';
import { DarkTheme as NavDarkTheme } from '@react-navigation/native';
import Color from 'color';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNativePaper {
    interface ThemeColors {
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

// https://github.com/callstack/react-native-paper/blob/main/src/styles/DarkTheme.tsx
// https://akveo.github.io/react-native-ui-kitten/docs/design-system/eva-dark-theme
export const PAPER_THEME: ReactNativePaper.Theme = {
  ...PaperDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    primary: '#3366FF', // blue
    accent: '#FFCC33', // light orange
    background: '#151A30', // Dark blue/grey
    surface: '#151A30',
    // surface: '#222B45', // Lighter background
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
