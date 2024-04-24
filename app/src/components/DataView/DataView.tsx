import { StyleProp, ViewStyle } from 'react-native';
import { Node, NodeValue } from './Node';
import { createStyles, useStyles } from '@theme/styles';
import { Chain } from 'chains';
import { Surface } from 'react-native-paper';

export interface DataViewProps {
  children: NodeValue;
  chain: Chain;
  style?: StyleProp<ViewStyle>;
}

export function DataView({ children, chain, style }: DataViewProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <Surface elevation={1} style={[styles.container, style]}>
      <Node chain={chain}>{children}</Node>
    </Surface>
  );
}

const stylesheet = createStyles(({ colors, corner }) => ({
  container: {
    backgroundColor: colors.surfaceContainer.mid,
    borderRadius: corner.l,
    padding: 16,
  },
}));
