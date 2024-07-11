import { createStyles, useStyles } from '@theme/styles';
import { View, ViewProps } from 'react-native';

export type PaneProps = ViewProps & {
  padding?: boolean;
} & ({ fixed: true; flex?: never } | { fixed?: never; flex: true });

export function Pane({ padding = true, flex: _, fixed, ...props }: PaneProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <View
      {...props}
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
