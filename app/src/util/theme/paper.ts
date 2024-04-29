import { MD3LightTheme as rnpBaseTheme, configureFonts } from 'react-native-paper';
import color from 'color';
import { match } from 'ts-pattern';
import { Palette as palette } from './palette';
import { MD3Type } from 'react-native-paper/lib/typescript/types';

const FONT_BY_WEIGHT = {
  '400': 'Roboto',
  '500': 'Roboto-Medium',
} as const;

const c = (c: string, f: (color: color<string>) => color<string>) => f(color(c)).hexa();

const opacity = {
  1: 0.08,
  2: 0.12,
  3: 0.16,
  4: 0.38,
} as const;

const colors = {
  primary: palette.primary[40],
  inversePrimary: palette.primary[80],
  onPrimary: palette.primary[100],
  primaryContainer: palette.primary[90],
  onPrimaryContainer: palette.primary[10],
  secondary: palette.secondary[40],
  onSecondary: palette.secondary[100],
  secondaryContainer: palette.secondary[90],
  onSecondaryContainer: palette.secondary[10],
  tertiary: palette.tertiary[40],
  onTertiary: palette.tertiary[100],
  tertiaryContainer: palette.tertiary[90],
  onTertiaryContainer: palette.tertiary[10],
  surface: palette.neutral[98],
  inverseSurface: palette.neutral[20],
  onSurface: palette.neutral[10],
  inverseOnSurface: palette.neutral[95],
  /**
   * @deprecated Use `surface` instead
   */
  background: palette.neutral[98],
  onBackground: palette.neutral[10],
  surfaceContainer: {
    lowest: palette.neutral[100],
    low: palette.neutral[96],
    mid: palette.neutral[94],
    high: palette.neutral[92],
    highest: palette.neutral[90],
  },
  /**
   * @deprecated Use `surfaceContainer` instead
   */
  elevation: {
    level0: 'transparent',
    // Note: Color values with transparency cause RN to transfer shadows to children nodes
    // instead of View component in Surface. Providing solid background fixes the issue.
    // Opaque color values generated with `palette.primary99` used as background
    level1: 'rgb(247, 243, 249)', // palette.primary40, alpha 0.05
    level2: 'rgb(243, 237, 246)', // palette.primary40, alpha 0.08
    level3: 'rgb(238, 232, 244)', // palette.primary40, alpha 0.11
    level4: 'rgb(236, 230, 243)', // palette.primary40, alpha 0.12
    level5: 'rgb(233, 227, 241)', // palette.primary40, alpha 0.14
  },
  /**
   * @deprecated Use `surfaceContainer.highest` instead
   */
  surfaceVariant: palette.neutralVariant[90],
  onSurfaceVariant: palette.neutralVariant[30],
  surfaceDisabled: color(palette.neutral[10]).alpha(opacity[2]).rgb().string(),
  onSurfaceDisabled: color(palette.neutral[10]).alpha(opacity[4]).rgb().string(),
  error: palette.error[40],
  onError: palette.error[100],
  errorContainer: palette.error[90],
  onErrorContainer: palette.error[10],
  outline: palette.neutralVariant[50],
  outlineVariant: palette.neutralVariant[80],
  shadow: palette.neutral[0],
  scrim: c(palette.neutral[30], (c) => c.alpha(0.4)),
  onScrim: palette.neutral[98],
  backdrop: color(palette.neutralVariant[20]).alpha(0.4).rgb().string(),
  success: palette.success[40], // Dark - Palette.success80
  onSuccess: palette.success[100], // Dark - Platte.success20
  successContainer: palette.success[90], // Dark - Palette.success30
  onSuccessContainer: palette.success[10], // Dark - Palette.success90
  warning: palette.warning[40], // Dark - Palette.warning80
  onWarning: palette.warning[100], // Dark - Platte.warning20
  warningContainer: palette.warning[90], // Dark - Palette.warning30
  onWarningContainer: palette.warning[10], // Dark - Palette.warning90
} as const;

// https://github.com/callstack/react-native-paper/blob/main/src/styles/themes/v3/DarkTheme.tsx
export const LIGHT_THEME = {
  dark: false,
  roundness: 4,
  version: 3,
  isV3: true,
  animation: { scale: 1.0 },
  colors,

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
      const bgKey = Object.keys(colors).find((key) => (colors as any)[key] === backgroundColor);

      if (bgKey && bgKey.length >= 1) {
        const onColor = (colors as any)[`on${bgKey[0]!.toUpperCase()}${bgKey.slice(1)}`];

        if (onColor) return onColor;
      }
    }

    return colors.onSurface;
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
    config: Object.fromEntries(
      Object.entries(rnpBaseTheme.fonts).map(
        ([variant, properties]): [string, Partial<MD3Type>] => {
          const fontFamily = FONT_BY_WEIGHT[(properties.fontWeight as '400') ?? '400'];
          if (__DEV__ && !fontFamily)
            throw new Error(`No font family configured for weight: ${properties.fontWeight}`);

          return [variant, { ...(fontFamily && { fontFamily }) }];
        },
      ),
    ),
  }),
} as const;

export const ICON_SIZE = LIGHT_THEME.iconSize;
export const CORNER = LIGHT_THEME.corner;

export type Theme = typeof LIGHT_THEME;
type AppTheme = Theme;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNativePaper {
    type Theme = AppTheme;
    // interface Theme extends AppTheme {}
  }
}
