import { HomeScreen } from '@features/home/HomeScreen';
import {
  createDrawerNavigator,
  DrawerScreenProps,
} from '@react-navigation/drawer';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { TabNavigatorScreenProps } from './TabNavigator';
import { Drawer as DrawerContent } from '@features/home/drawer/Drawer';

export type DrawerNavigatorParamList = {
  Home: undefined;
};

export type DrawerNavigatorParams =
  NavigatorScreenParams<DrawerNavigatorParamList>;

export type DrawerNavigatorScreenProps<
  K extends keyof DrawerNavigatorParamList,
> = CompositeScreenProps<
  TabNavigatorScreenProps<'DrawerNavigator'>,
  DrawerScreenProps<DrawerNavigatorParamList, K>
>;

const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={DrawerContent}
      screenOptions={{ headerShown: false, swipeEnabled: false }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
    </Drawer.Navigator>
  );
};
