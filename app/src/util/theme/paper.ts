import { MD3DarkTheme as PaperDarkTheme, useTheme as baseUseTheme } from 'react-native-paper';
import { space, typoSpace } from './styledComponents';
import color from 'color';

const c = (c: string, f: (color: color<string>) => color<string>) => f(color(c)).rgb().string();

const overrided: typeof PaperDarkTheme = {
  ...PaperDarkTheme,
};

const opacity = {
  disabled: 0.6,
} as const;

// https://github.com/callstack/react-native-paper/blob/main/src/styles/themes/v3/DarkTheme.tsx
export const PAPER_THEME = {
  ...overrided,
  colors: {
    ...overrided.colors,

    onSurfaceOpaque: c(overrided.colors.onSurface, (c) => c.alpha(opacity.disabled)),

    success: '#48C12A', // Green
    info: '#559EFC', // Blue
    warning: '#FFAF30', // Orange
  },
  opacity,

  space,
  typoSpace,
  onBackground: (backgroundColor?: string): string | undefined => {
    if (backgroundColor) {
      const bgKey = Object.keys(overrided.colors).find(
        (key) => (overrided.colors as any)[key] === backgroundColor,
      );

      if (bgKey) {
        const onColor = (overrided.colors as any)[`on${bgKey[0].toUpperCase()}${bgKey.slice(1)}`];

        if (onColor) return onColor;
      }
    }

    return overrided.colors.onSurface;
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
  baseUseTheme<ThemeOverride>(overrides);
