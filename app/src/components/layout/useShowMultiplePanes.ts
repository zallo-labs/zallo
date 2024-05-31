import { BREAKPOINTS, useStyles } from '@theme/styles';

export function useShowMultiplePanes() {
  const { breakpoint } = useStyles();
  return BREAKPOINTS[breakpoint] >= BREAKPOINTS.expanded;
}
