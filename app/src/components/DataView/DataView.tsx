import { View } from 'react-native';
import { Node, NodeValue } from './Node';
import { makeStyles } from '@theme/makeStyles';

export interface DataViewProps {
  children: NodeValue;
}

export const DataView = ({ children }: DataViewProps) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Node style={styles.node}>{children}</Node>
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  container: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    margin: 16,
    padding: 16,
  },
  node: {
    color: colors.onSurfaceVariant,
  },
}));
