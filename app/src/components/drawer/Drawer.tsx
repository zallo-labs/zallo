import { ComponentPropsWithoutRef, FC, useState } from 'react';
// import { Drawer as DrawerLayout } from 'expo-router/drawer';      // Navigator
import { Drawer as DrawerLayout } from 'react-native-drawer-layout'; // Not navigator
import { DrawerContextProvider, useDrawerType, useNavType } from './DrawerContextProvider';
import { createStyles, useStyles } from '@theme/styles';
import { RailLayout } from './RailLayout';

type DrawerLayoutProps = ComponentPropsWithoutRef<typeof DrawerLayout>;

export interface DrawerProps extends Omit<Partial<DrawerLayoutProps>, 'renderDrawerContent'> {
  DrawerContent: FC;
  RailContent: FC;
}

export function Drawer({ children, DrawerContent, RailContent, ...props }: DrawerProps) {
  const { styles } = useStyles(stylesheet);
  const navType = useNavType();
  const drawerType = useDrawerType();

  const [open, setOpen] = useState(false);

  return (
    <DrawerContextProvider setOpen={setOpen}>
      <DrawerLayout
        {...props}
        renderDrawerContent={() => <DrawerContent />}
        drawerPosition="left"
        drawerType={drawerType === 'standard' ? 'permanent' : 'front'}
        drawerStyle={styles.drawer}
        overlayStyle={styles.overlay}
        style={styles.sceneContainer}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      >
        {navType === 'rail' ? <RailLayout Rail={RailContent}>{children}</RailLayout> : children}
      </DrawerLayout>
    </DrawerContextProvider>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  drawer: {
    backgroundColor: 'transparent',
    width: {
      // Modal type
      compact: 360,
      // Standard type
      large: 360,
    },
    //  Unset borders
    borderLeftWidth: undefined,
    borderRightWidth: undefined,
    overflow: 'hidden',
  },
  overlay: {
    backgroundColor: colors.scrim,
  },
  sceneContainer: {
    backgroundColor: colors.surfaceContainer.low,
  },
}));
