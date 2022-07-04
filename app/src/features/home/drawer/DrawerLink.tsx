import { useRoute } from '@react-navigation/native';
import { ComponentPropsWithoutRef } from 'react';
import { Drawer } from 'react-native-paper';
import { DrawerNavigatorParamList } from '@features/navigation/DrawerNavigator';
import { RootNavigatorParamList } from '@features/navigation/RootNavigator';
import { TabNavigatorParamList } from '@features/navigation/TabNavigator';
import { useDrawerNavigation } from './Drawer';

type Screen =
  | keyof RootNavigatorParamList
  | keyof TabNavigatorParamList
  | keyof DrawerNavigatorParamList;

type DrawerItemProps = ComponentPropsWithoutRef<typeof Drawer.Item>;

export type DrawerLinkProps = Omit<DrawerItemProps, 'label'> & {
  screen: Screen;
  label?: string;
};

export const DrawerLink = ({ screen, ...props }: DrawerLinkProps) => {
  const route = useRoute();
  const navigate = useDrawerNavigation();

  const active = route.name === screen;

  return (
    <Drawer.Item
      label={screen}
      active={active}
      onPress={!active ? () => navigate(screen) : undefined}
      {...props}
    />
  );
};
