import { StyleProp, View, ViewStyle } from 'react-native';

import { Chain } from 'chains';
import { createStyles, useStyles } from '~/util/theme/styles';
import { Node, NodeValue } from './Node';

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
