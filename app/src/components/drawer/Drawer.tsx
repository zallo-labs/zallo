import { ComponentPropsWithoutRef } from 'react';
import { Drawer as DrawerLayout } from 'expo-router/drawer';
import { DrawerContextProvider, DrawerType } from './DrawerContextProvider';
import { AppbarHeader } from '#/Appbar/AppbarHeader';
import { BREAKPOINTS, createStyles, useStyles } from '@theme/styles';

type DrawerLayoutProps = ComponentPropsWithoutRef<typeof DrawerLayout>;

export interface DrawerProps extends DrawerLayoutProps {}

export function Drawer({ children, ...props }: DrawerProps) {
  const { styles, breakpoint } = useStyles(stylesheet);
  const type: DrawerType = BREAKPOINTS[breakpoint] >= BREAKPOINTS.expanded ? 'standard' : 'modal';

  return (
    <DrawerContextProvider type={type}>
      <DrawerLayout
        backBehavior="history"
        {...props}
        screenOptions={{
          header: AppbarHeader,
          drawerPosition: 'left',
          drawerType: type === 'standard' ? 'permanent' : 'front',
          drawerStyle: styles.drawer,
          overlayColor: styles.overlay.backgroundColor,
          sceneContainerStyle: styles.sceneContainer,
          ...props.screenOptions,
        }}
      >
        {children}
      </DrawerLayout>
    </DrawerContextProvider>
  );
}

Drawer.Screen = DrawerLayout.Screen;

const stylesheet = createStyles(({ colors }) => {
  const backgroundColor = {
    expanded: colors.surfaceContainer.low, // standard type
  };

  return {
    drawer: {
      backgroundColor,
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
      backgroundColor,
    },
  };
});
