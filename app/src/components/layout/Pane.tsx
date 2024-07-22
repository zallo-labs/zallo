import { createStyles, useStyles } from '@theme/styles';
import { useAtomValue, useSetAtom } from 'jotai';
import { useLayoutEffect, useRef } from 'react';
import { ViewProps } from 'react-native';
import { PANES_MOUNTED } from './Panes';
import { BREAKPOINTS } from '@theme/styles';
import Animated, { FadeIn } from 'react-native-reanimated';

const MAX_PANES: Record<keyof typeof BREAKPOINTS, number> = {
  compact: 1,
  medium: 1,
  expanded: 2,
  large: 2,
  extraLarge: 3,
  // Injected by unistyles; never actually used
  landscape: 1,
  portrait: 1,
};

export type PaneProps = ViewProps & {
  padding?: boolean;
} & ({ fixed: true; flex?: never } | { fixed?: never; flex: true });

export function Pane({ padding = true, flex, fixed: _, ...props }: PaneProps) {
  const { styles, breakpoint } = useStyles(stylesheet);
  const order = usePaneMounted();
  const maxPanes = MAX_PANES[breakpoint];
  const count = useAtomValue(PANES_MOUNTED);

  const withinWindow = (order.current ?? 0) < count - maxPanes;
  if (count > maxPanes && withinWindow) return null;

  // Flex a fixed pane when it is the only one visible
  const fixed = !flex && count !== 1;

  return (
    <Animated.View
      {...props}
      entering={FadeIn.duration(200)}
      // exiting depends on how the pane was removed
      style={[styles.flex, fixed && styles.fixed, padding && styles.margins, props.style]}
    />
  );
}

const stylesheet = createStyles(({ padding }) => ({
  flex: {
    flex: 1, // Flexes horizontally with `flexDirection: row` parent
    flexDirection: 'column',
  },
  fixed: {
    maxWidth: {
      expanded: 360,
      large: 412,
    },
  },
  margins: {
    paddingHorizontal: padding,
  },
}));

function usePaneMounted() {
  const order = useRef<number | null>(null);
  const setCount = useSetAtom(PANES_MOUNTED);
  const count = useAtomValue(PANES_MOUNTED);

  // Effect before render to avoid layout shifting
  useLayoutEffect(() => {
    if (order.current === null) order.current = count;

    setCount((count) => {
      return count + 1;
    });

    return () => setCount((c) => c - 1);
  }, [count, setCount]);

  return order;
}

export function usePaneIndex() {
  return useAtomValue(PANES_MOUNTED);
}
