import { ReactNode } from 'react';
import { createStyles, useStyles } from '@theme/styles';
import { View } from 'react-native';
import { DrawerType, useMaybeDrawerContext } from '#/drawer/DrawerContextProvider';

export interface PanesProps {
  children: ReactNode;
}

export function Panes({ children }: PanesProps) {
  const { styles } = useStyles(stylesheet);
  const drawerType = useMaybeDrawerContext()?.type;

  // Show only latest pane when a single is shown

  return <View style={styles.container(drawerType)}>{children}</View>;
}

const stylesheet = createStyles(() => ({
  container: (drawerType?: DrawerType) => ({
    flex: 1,
    flexDirection: 'row',
    gap: 24,
    marginLeft: {
      compact: drawerType === 'modal' ? 16 :  0,
      medium: drawerType === 'modal' ? 24 : 0,
    },
    marginRight: {
      compact: 16,
      medium: 24,
    },
  }),
}));
