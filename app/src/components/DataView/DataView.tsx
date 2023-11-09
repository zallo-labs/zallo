import { StyleProp, View, ViewStyle } from 'react-native';
import { Node, NodeValue } from './Node';
import { createStyles, useStyles } from '@theme/styles';

export interface DataViewProps {
  children: NodeValue;
  style?: StyleProp<ViewStyle>;
}

export const DataView = ({ children, style }: DataViewProps) => {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={[styles.container, style]}>
      <Node style={styles.node}>{children}</Node>
    </View>
  );
};

const stylesheet = createStyles(({ colors }) => ({
  container: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 16,
  },
  node: {
    color: colors.onSurfaceVariant,
  },
}));
