import { ReactNode } from 'react';
import { createStyles } from '@theme/styles';
import { View } from 'react-native';

export interface PanesProps {
  children: ReactNode;
}

export function Panes({ children }: PanesProps) {
  return <View style={styles.container}>{children}</View>;
}

const styles = createStyles({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  },
});
