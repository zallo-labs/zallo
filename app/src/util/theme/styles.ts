import { createUnistyles } from 'react-native-unistyles';

import { PAPER_THEME as theme } from './paper';

const breakpoints = {
  compact: 0,
  medium: 600,
  expanded: 840,
} as const;

export const { createStyleSheet: createStyles, useStyles } = createUnistyles<
  typeof breakpoints,
  typeof theme
>(breakpoints);
