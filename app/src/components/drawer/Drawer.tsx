import { ComponentPropsWithoutRef, useState } from 'react';
// import { Drawer as DrawerLayout } from 'expo-router/drawer';      // Navigator
import { Drawer as DrawerLayout } from 'react-native-drawer-layout'; // Not navigator
import { DrawerContextProvider, useExpectedDrawerTpe } from './DrawerContextProvider';
import { createStyles, useStyles } from '@theme/styles';

type DrawerLayoutProps = ComponentPropsWithoutRef<typeof DrawerLayout>;

export interface DrawerProps extends Omit<Partial<DrawerLayoutProps>, 'renderDrawerContent'> {
  drawerContent: DrawerLayoutProps['renderDrawerContent'];
}

export function Drawer({ children, drawerContent, ...props }: DrawerProps) {
  const { styles } = useStyles(stylesheet);
  const type = useExpectedDrawerTpe();

  const [open, setOpen] = useState(false);

  return (
    <DrawerContextProvider type={type} setOpen={setOpen}>
      <DrawerLayout
        {...props}
        renderDrawerContent={drawerContent}
        drawerPosition="left"
        drawerType={type === 'standard' ? 'permanent' : 'front'}
        drawerStyle={styles.drawer}
        overlayStyle={styles.overlay}
        style={styles.sceneContainer}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      >
        {children}
      </DrawerLayout>
    </DrawerContextProvider>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  drawer: {
    backgroundColor: colors.surfaceContainer.low,
    width: {
      // Modal type
      compact: 360,
      // Standard type
      large: 360,
    },
    //  Unset borders
    borderLeftWidth: undefined,
    borderRightWidth: undefined,
  },
  overlay: {
    backgroundColor: colors.scrim,
  },
  sceneContainer: {
    backgroundColor: colors.surfaceContainer.low,
  },
}));
