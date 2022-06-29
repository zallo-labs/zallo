import {
  useNavigation,
  useNavigationState,
  useRoute,
} from '@react-navigation/native';
import { ComponentPropsWithoutRef, useCallback, useMemo } from 'react';
import { Drawer } from 'react-native-paper';
import { HomeScreenProps } from '../HomeScreen';
import { DrawerNavigatorParamList } from '@features/navigation/DrawerNavigator';
import { RootNavigatorParamList } from '@features/navigation/RootNavigator';
import { TabNavigatorParamList } from '@features/navigation/TabNavigator';

type Screen =
  | keyof RootNavigatorParamList
  | keyof TabNavigatorParamList
  | keyof DrawerNavigatorParamList;

type DItemProps = ComponentPropsWithoutRef<typeof Drawer.Item>;

export type DrawerItemProps = Omit<DItemProps, 'label'> & {
  screen: Screen;
  label?: string;
};

export const DrawerItem = ({ screen, ...props }: DrawerItemProps) => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const route = useRoute();

  const active = route.name === screen;

  const handlePress = useCallback(() => {
    navigation.navigate(screen);
    // navigation.closeDrawer();
  }, [navigation, screen]);

  // console.log({
  //   route,
  //   state: navigation.getState()
  // });

  return (
    <Drawer.Item
      label={screen}
      active={active}
      onPress={!active ? handlePress : undefined}
      {...props}
    />
  );
};
