import { createDrawerNavigator, DrawerScreenProps } from '@react-navigation/drawer';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { RootNavigatorScreenProps } from '../RootNavigator';
import { BottomNavigator } from '../BottomNavigator';
import { DrawerContent } from './DrawerContent';

export type DrawerNavigatorParamList = {
  BottomNavigator: undefined;
};

export type DrawerNavigatorParams = NavigatorScreenParams<DrawerNavigatorParamList>;

export type DrawerNavigatorScreenProps<K extends keyof DrawerNavigatorParamList> =
  CompositeScreenProps<
    RootNavigatorScreenProps<'DrawerNavigator'>,
    DrawerScreenProps<DrawerNavigatorParamList, K>
  >;

const Drawer = createDrawerNavigator<DrawerNavigatorParamList>();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator drawerContent={DrawerContent} screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="BottomNavigator" component={BottomNavigator} />
    </Drawer.Navigator>
  );
};
