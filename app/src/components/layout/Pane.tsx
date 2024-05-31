import { createStyles, useStyles } from '@theme/styles';
import { View, ViewProps } from 'react-native';

export type PaneProps = ViewProps & ({ fixed: true; flex?: never } | { fixed?: never; flex: true });

export function Pane({ fixed, ...props }: PaneProps) {
  const { styles } = useStyles(stylesheet);

  return <View {...props} style={[styles.flex, fixed && styles.fixed, props.style]} />;
}

const stylesheet = createStyles(() => ({
  flex: {
    flex: 1, // Flexes horizontally with `flexDirection: row` parent
    flexDirection: 'column',
  },
  fixed: {
    maxWidth: {
      medium: 360,
      large: 412, // TODO: check
    },
  },
}));
