import {
  UnistylesRegistry,
  createStyleSheet as createStyles,
  useStyles,
} from 'react-native-unistyles';
import { LIGHT_THEME } from './paper';

export { createStyles, useStyles };

const themes = {
  light: LIGHT_THEME,
};
type Themes = typeof themes;

const breakpoints = {
  compact: 0,
  medium: 600,
  expanded: 840,
  large: 1200,
  extraLarge: 1600,
} as const;
type Breakpoints = typeof breakpoints;

export const BREAKPOINTS = {
  ...breakpoints,
  // Required for BREAKPOINTS[useStyles().breakpoint] as UniStylesBreakpoints always include landscape & portrait
  landscape: 0,
  portrait: 0,
};

declare module 'react-native-unistyles' {
  export interface UnistylesBreakpoints extends Breakpoints {}
  export interface UnistylesThemes extends Themes {}
}

UnistylesRegistry.addThemes(themes).addBreakpoints(breakpoints).addConfig({
  initialTheme: 'light',
  adaptiveThemes: false,
});
