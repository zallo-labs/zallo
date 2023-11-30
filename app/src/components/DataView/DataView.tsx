import { StyleProp, View, ViewStyle } from 'react-native';
import { Node, NodeValue } from './Node';
import { createStyles, useStyles } from '@theme/styles';
import { Chain } from 'chains';

export interface DataViewProps {
  children: NodeValue;
  chain: Chain;
  style?: StyleProp<ViewStyle>;
}

export function DataView({ children, chain, style }: DataViewProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={[styles.container, style]}>
      <Node chain={chain} style={styles.node}>
        {children}
      </Node>
    </View>
  );
}

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
