import { createStyles, useStyles } from '@theme/styles';
import { useAtomValue, useSetAtom } from 'jotai';
import { useLayoutEffect, useRef } from 'react';
import { View, ViewProps } from 'react-native';
import { PANES_MOUNTED } from './Panes';
import { useNavigationState, useRoute } from '@react-navigation/native';

export type PaneProps = ViewProps & {
  padding?: boolean;
} & ({ fixed: true; flex?: never } | { fixed?: never; flex: true });

export function Pane({ padding = true, flex, fixed: _, ...props }: PaneProps) {
  const { styles } = useStyles(stylesheet);
  // const order = usePaneMounted();
  // const maxPanes = MAX_PANES[breakpoint];
  // const count = useAtomValue(PANES_MOUNTED);

  // const withinWindow = (order.current ?? 0) < count - maxPanes;
  // const hidden = count > maxPanes && withinWindow;
  // if (count > maxPanes && withinWindow)
  //   return <View style={{ width: 20, backgroundColor: 'red' }} />;

  const route = useRoute();
  const isSelected = useNavigationState((state) => state.routes[state.index].key === route.key);

  // Flex a fixed pane when it is the only one visible
  const fixed = !flex && !isSelected;

  return (
    <View
      {...props}
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

    setCount((count) => count + 1);

    return () => setCount((count) => count - 1);
  }, [count, setCount]);

  return order;
}

export function usePaneIndex() {
  return useAtomValue(PANES_MOUNTED);
}
