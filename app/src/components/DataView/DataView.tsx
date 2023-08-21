import { StyleProp, View, ViewStyle } from 'react-native';
import { Node, NodeValue } from './Node';
import { makeStyles } from '@theme/makeStyles';

export interface DataViewProps {
  children: NodeValue;
  style?: StyleProp<ViewStyle>;
}

export const DataView = ({ children, style }: DataViewProps) => {
  const styles = useStyles();

  return (
    <View style={[styles.container, style]}>
      <Node style={styles.node}>{children}</Node>
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  container: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 16,
  },
  node: {
    color: colors.onSurfaceVariant,
  },
}));
