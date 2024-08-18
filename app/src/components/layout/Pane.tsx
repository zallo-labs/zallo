import { createStyles, useStyles } from '@theme/styles';
import { View, ViewProps } from 'react-native';
import { useNavigationState, useRoute } from '@react-navigation/native';

export type PaneProps = ViewProps & {
  padding?: boolean;
} & ({ fixed: true; flex?: never } | { fixed?: never; flex: true });

export function Pane({ padding = true, flex, fixed: _, ...props }: PaneProps) {
  const { styles } = useStyles(stylesheet);

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
