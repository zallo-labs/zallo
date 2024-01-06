import color from 'color';
import { configureFonts, MD3LightTheme as overrided } from 'react-native-paper';
import { MD3Type } from 'react-native-paper/lib/typescript/types';
import { match } from 'ts-pattern';

import { FONT_BY_WEIGHT } from '~/components/Fonts';
import { Palette } from './palette';

const c = (c: string, f: (color: color<string>) => color<string>) => f(color(c)).hexa();

// https://github.com/callstack/react-native-paper/blob/main/src/styles/themes/v3/DarkTheme.tsx
export const PAPER_THEME = {
  ...overrided,

  colors: {
    ...overrided.colors,

    surfaceDisabled: c(overrided.colors.onSurface, (c) => c.alpha(0.12)),
    onSurfaceOpaque: c(overrided.colors.onSurface, (c) => c.alpha(0.6)),

    scrim: c(Palette.neutral20, (c) => c.alpha(0.4)),
    onScrim: '#F4EFF4',

    success: Palette.success40, // Dark - Palette.success80
    onSuccess: Palette.success100, // Dark - Platte.success20
    successContainer: Palette.success90, // Dark - Palette.success30
    onSuccessContainer: Palette.success10, // Dark - Palette.success90
    warning: Palette.warning40, // Dark - Palette.warning80
    onWarning: Palette.warning100, // Dark - Platte.warning20
    warningContainer: Palette.warning90, // Dark - Palette.warning30
    onWarningContainer: Palette.warning10, // Dark - Palette.warning90
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

      if (bgKey && bgKey.length >= 1) {
        const onColor = (overrided.colors as any)[`on${bgKey[0]!.toUpperCase()}${bgKey.slice(1)}`];

        if (onColor) return onColor;
      }
    }

    return overrided.colors.onSurface;
  },

  iconSize: {
    small: 24,
    medium: 40,
    large: 60,
    extraLarge: 80,
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

  // Android doesn't support different font variants based on weight like web; so we change the family name
  fonts: configureFonts({
    isV3: true,
    config: Object.fromEntries(
      Object.entries(overrided.fonts).map(([variant, properties]): [string, Partial<MD3Type>] => {
        const fontFamily = FONT_BY_WEIGHT[properties.fontWeight ?? '400'];
        if (__DEV__ && !fontFamily)
          throw new Error(`No font family configured for weight: ${properties.fontWeight}`);

        return [variant, { ...(fontFamily && { fontFamily }) }];
      }),
    ),
  }),
};

export const ICON_SIZE = PAPER_THEME.iconSize;
export const CORNER = PAPER_THEME.corner;
export const ROUNDNESS = PAPER_THEME.roundness;

export type Theme = typeof PAPER_THEME;
type AppTheme = Theme;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNativePaper {
    type Theme = AppTheme;
    // interface Theme extends AppTheme {}
  }
}
