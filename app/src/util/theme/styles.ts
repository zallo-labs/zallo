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
} as const;
type Breakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesBreakpoints extends Breakpoints {}
  export interface UnistylesThemes extends Themes {}
}

UnistylesRegistry.addThemes(themes).addBreakpoints(breakpoints).addConfig({
  initialTheme: 'light',
  adaptiveThemes: false,
});
