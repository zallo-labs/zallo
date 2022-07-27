import {
  MD3DarkTheme as PaperDarkTheme,
  useTheme as baseUseTheme,
} from 'react-native-paper';
import { STYLED_COMPONENTS_THEME } from './styledComponents';

const overrided: typeof PaperDarkTheme = {
  ...PaperDarkTheme,
  roundness: 8,
};

// https://github.com/callstack/react-native-paper/blob/main/src/styles/themes/v3/DarkTheme.tsx
export const PAPER_THEME = {
  ...overrided,
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
    large: 60,
  },
  iconButton: {
    size: 24,
    containerSize: 40,
  },
};

export type ThemeOverride = typeof PAPER_THEME;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNativePaper {
    // type Theme = ThemeOverride;
    interface Theme extends ThemeOverride {}
  }
}

export const useTheme = (overrides?: Partial<ThemeOverride>): ThemeOverride =>
  baseUseTheme(overrides);
