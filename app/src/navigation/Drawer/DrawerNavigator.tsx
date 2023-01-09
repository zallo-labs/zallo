import { createDrawerNavigator, DrawerScreenProps } from '@react-navigation/drawer';
import { NavigatorScreenParams } from '@react-navigation/native';
import { DrawerContent } from './DrawerContent';
import { StackNavigator } from '../StackNavigator';

export type DrawerNavigatorParamList = {
  StackNavigator: undefined;
};

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
