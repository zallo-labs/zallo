import {
  createDrawerNavigator,
  DrawerNavigationProp,
  DrawerScreenProps,
} from '@react-navigation/drawer';
import { NavigatorScreenParams } from '@react-navigation/native';
import { DrawerContent } from './DrawerContent';
import { StackNavigator, StackNavigatorParamList } from '../StackNavigator';

export type DrawerNavigatorParamList = {
  StackNavigator: NavigatorScreenParams<StackNavigatorParamList>;
};

export type DrawerNavigationNavigateProp = DrawerNavigationProp<DrawerNavigatorParamList>;

export type DrawerNavigatorParams = NavigatorScreenParams<DrawerNavigatorParamList>;

export type DrawerNavigatorScreenProps<K extends keyof DrawerNavigatorParamList> =
  DrawerScreenProps<DrawerNavigatorParamList, K>;

const Drawer = createDrawerNavigator<DrawerNavigatorParamList>();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator drawerContent={DrawerContent} screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="StackNavigator" component={StackNavigator} />
    </Drawer.Navigator>
  );
};
