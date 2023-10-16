import { ComponentPropsWithoutRef } from 'react';
import { Drawer as DrawerLayout } from 'expo-router/drawer';
import { DrawerContent } from '~/components/drawer/DrawerContent';
import { makeStyles } from '@theme/makeStyles';
import { useLayout } from '~/hooks/useLayout';
import { DrawerContextProvider, DrawerType } from './DrawerContextProvider';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { AppbarHeader } from '~/components/Appbar/AppbarHeader';

type DrawerLayoutProps = ComponentPropsWithoutRef<typeof DrawerLayout>;

export interface DrawerProps extends DrawerLayoutProps {}

// TODO: only use 'modal' type in compact and medium layouts
export function Drawer({ children, ...props }: DrawerProps) {
  const layout = useLayout();
  const type: DrawerType = layout.class === 'expanded' ? 'standard' : 'modal';
  const styles = useStyles(type);
  const navigation = useNavigation();

  return (
    <DrawerContextProvider
      type={type}
      toggle={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      open={() => navigation.dispatch(DrawerActions.openDrawer())}
      close={() => navigation.dispatch(DrawerActions.closeDrawer())}
    >
      <DrawerLayout
        drawerContent={DrawerContent}
        {...props}
        screenOptions={{
          header: AppbarHeader,
          drawerPosition: 'left',
          drawerType: type === 'standard' ? 'permanent' : 'front',
          drawerStyle: styles.drawer,
          overlayColor: styles.overlay.backgroundColor,
          ...props.screenOptions,
        }}
      >
        {children}
      </DrawerLayout>
    </DrawerContextProvider>
  );
}

Drawer.Screen = DrawerLayout.Screen;

const useStyles = makeStyles(({ colors }, type: DrawerType) => ({
  drawer: {
    backgroundColor: 'transparent',
    width: 360,
  },
  overlay: {
    backgroundColor: colors.scrim,
  },
}));
