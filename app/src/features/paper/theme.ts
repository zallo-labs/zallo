import { DarkTheme } from 'react-native-paper';

// https://akveo.github.io/react-native-ui-kitten/docs/design-system/eva-dark-theme
export const THEME: ReactNativePaper.Theme = {
  ...DarkTheme,
  mode: 'adaptive',
  colors: {
    ...DarkTheme.colors,
    primary: '#3366FF', // blue
    accent: '#FFCC33', // light orange
    background: '#151A30', // Dark blue/grey
    surface: '#222B45', // Lighter background
    success: '#48C12A', // Green
    info: '#559EFC', // Blue
    warning: '#FFAF30', // Orange
    danger: '#FF4128', // Red
  },
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNativePaper {
    interface ThemeColors {
      success: string;
      info: string;
      warning: string;
      danger: string;
    }

    // interface Theme {}
  }
}
