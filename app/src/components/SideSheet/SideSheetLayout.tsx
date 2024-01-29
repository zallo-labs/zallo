import { createStyles, useStyles } from '@theme/styles';
import { ReactNode } from 'react';
import { View } from 'react-native';

export interface SideSheetLayoutProps {
  children: ReactNode;
}

export function SideSheetLayout({ children }: SideSheetLayoutProps) {
  const { styles } = useStyles(stylesheet);

  return <View style={styles.container}>{children}</View>;
}

const stylesheet = createStyles({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
});
