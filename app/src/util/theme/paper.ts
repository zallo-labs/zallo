import { MD3DarkTheme as PaperDarkTheme, useTheme as baseUseTheme } from 'react-native-paper';
import { space, typoSpace, space2, font } from './styledComponents';
import color from 'color';

const c = (c: string, f: (color: color<string>) => color<string>) => f(color(c)).rgb().string();

const overrided: typeof PaperDarkTheme = {
  ...PaperDarkTheme,
};

const opacityModifier = {
  // https://m3.material.io/foundations/interaction-states
  hover: 0.08,
  focus: 0.12,
  press: 0.12,
  drag: 0.16,
} as const;

const opacity = {
  disabled: 0.38,
  opaque: 0.6,
} as const;

// https://github.com/callstack/react-native-paper/blob/main/src/styles/themes/v3/DarkTheme.tsx
export const PAPER_THEME = {
  ...overrided,

  colors: {
    ...overrided.colors,

    surfaceFocussed: c(overrided.colors.surface, (c) => c.opaquer(opacityModifier.focus)),
    surfacePressed: c(overrided.colors.surface, (c) => c.opaquer(opacityModifier.press)),
    surfaceDisabled: c(overrided.colors.onSurface, (c) => c.alpha(opacityModifier.focus)),
    onSurfaceOpaque: c(overrided.colors.onSurface, (c) => c.alpha(opacity.opaque)),
    onSurfaceDisabled: c(overrided.colors.onSurface, (c) => c.alpha(opacity.disabled)),

    success: '#48C12A', // Green
    info: '#559EFC', // Blue
    warning: '#FFAF30', // Orange
  },
  color: c,
  opacity,
  opacityModifier,

  space,
  typoSpace,
  s: space2,
  font,
  iconSize2: (n: number) => n * 1.5,

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
  corner: {
    // https://m3.material.io/styles/shape/shape-scale-tokens
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 28,
    full: 1000,
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
