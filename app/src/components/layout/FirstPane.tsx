import { usePath } from '#/usePath';
import { BREAKPOINTS } from '@theme/styles';
import { useRouteNode } from 'expo-router/build/Route';
import { useStyles } from 'react-native-unistyles';
import { Pane, PaneProps } from './Pane';

export type FirstPaneProps = PaneProps;

export function FirstPane({ flex, fixed: _, ...props }: FirstPaneProps) {
  const { breakpoint } = useStyles();
  const path = usePath();
  const routeNode = useRouteNode();

  const onlyPane = routeNode && routeNode.contextKey.includes(path); // at /index

  // Only show when the only pane visible or on expanded layouts
  const show = onlyPane || BREAKPOINTS[breakpoint] >= BREAKPOINTS.expanded;
  if (!show) return null;

  // Flex a fixed pane when it is the only one visible
  return <Pane {...props} {...(flex || onlyPane ? { flex: true } : { fixed: true })} />;
}
