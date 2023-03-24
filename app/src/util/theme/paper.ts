import { MD3LightTheme as overrided, useTheme as baseUseTheme } from 'react-native-paper';
import color from 'color';
import { match } from 'ts-pattern';

const c = (c: string, f: (color: color<string>) => color<string>) => f(color(c)).hexa();

// https://github.com/callstack/react-native-paper/blob/main/src/styles/themes/v3/DarkTheme.tsx
export const PAPER_THEME = {
  ...overrided,

  colors: {
    ...overrided.colors,

    surfaceDisabled: c(overrided.colors.onSurface, (c) => c.alpha(0.12)),
    onSurfaceOpaque: c(overrided.colors.onSurface, (c) => c.alpha(0.6)),

    onScrim: '#F4EFF4',

    // Green
    green: '#4b6708',
    onGreen: '#ffffff',
    greenContainer: '#cdef85',
    onGreenContainer: '#131f00',
    // Orange
    orange: '#914c00',
    onOrange: '#ffffff',
    orangeContainer: '#ffdcc1',
    onOrangeContainer: '#2f1500',
  },

  // https://m3.material.io/foundations/interaction-states
  stateLayer: (
    color: string,
    state: 'normal' | false | undefined | 'hover' | 'focus' | 'pressed' | 'disabled',
  ) =>
    match(state)
      .with('hover', () => c(color, (c) => c.alpha(0.08)))
      .with('focus', () => c(color, (c) => c.alpha(0.12)))
      .with('pressed', () => c(color, (c) => c.alpha(0.12)))
      .with('disabled', () => c(color, (c) => c.alpha(0.38)))
      .otherwise(() => color),

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
  } as const,
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
  } as const,
};

export const ICON_SIZE = PAPER_THEME.iconSize;
export const CORNER = PAPER_THEME.corner;

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
