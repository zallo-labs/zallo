import { useNavigation, useRoute } from '@react-navigation/native';
import { ComponentPropsWithoutRef, useCallback } from 'react';
import { Drawer } from 'react-native-paper';
import { HomeScreenProps } from '../HomeScreen';
import { DrawerNavigatorParamList } from '@features/navigation/DrawerNavigator';
import { RootNavigatorParamList } from '@features/navigation/RootNavigator';
import { TabNavigatorParamList } from '@features/navigation/TabNavigator';

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
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const route = useRoute();

  const active = route.name === screen;

  const handlePress = useCallback(() => {
    navigation.navigate(screen);
  }, [navigation, screen]);

  return (
    <Drawer.Item
      label={screen}
      active={active}
      onPress={!active ? handlePress : undefined}
      {...props}
    />
  );
};
