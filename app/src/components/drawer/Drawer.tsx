import { ComponentPropsWithoutRef } from 'react';
import { Drawer as DrawerLayout } from 'expo-router/drawer';
import { DrawerContent } from '~/components/drawer/DrawerContent';
import { makeStyles } from '@theme/makeStyles';
import { useLayout } from '~/hooks/useLayout';
import { DrawerContextProvider, DrawerType } from './DrawerContextProvider';
import { AppbarHeader } from '~/components/Appbar/AppbarHeader';

type DrawerLayoutProps = ComponentPropsWithoutRef<typeof DrawerLayout>;

export interface DrawerProps extends DrawerLayoutProps {}

// TODO: only use 'modal' type in compact and medium layouts
export function Drawer({ children, ...props }: DrawerProps) {
  const { layout } = useLayout();
  const type: DrawerType = layout === 'expanded' ? 'standard' : 'modal';
  const styles = useStyles(type);

  return (
    <DrawerContextProvider type={type}>
      <DrawerLayout
        drawerContent={DrawerContent}
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

const useStyles = makeStyles(({ colors }, type: DrawerType) => {
  const backgroundColor = type === 'standard' ? colors.elevation.level1 : 'transparent';

  return {
    drawer: {
      backgroundColor,
      width: 360,
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
