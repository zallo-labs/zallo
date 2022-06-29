import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
} from '@react-navigation/material-top-tabs';
import { ActivityScreen } from '@features/activity/ActivityScreen';
import { RootNavigatorScreenProps } from './RootNavigator';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { DrawerNavigator } from './DrawerNavigator';

export type TabNavigatorParamList = {
  DrawerNavigator: undefined;
  Activity: undefined;
};

export type TabNavigatorParams = NavigatorScreenParams<TabNavigatorParamList>;

export type TabNavigatorScreenProps<K extends keyof TabNavigatorParamList> =
  CompositeScreenProps<
    RootNavigatorScreenProps<'TabNavigator'>,
    MaterialTopTabScreenProps<TabNavigatorParamList, K>
  >;

const Tab = createMaterialTopTabNavigator<TabNavigatorParamList>();

export const TabNavigator = () => (
  <Tab.Navigator
    initialRouteName="DrawerNavigator"
    tabBar={() => null}
    screenOptions={{ lazy: true }}
  >
    <Tab.Screen name="DrawerNavigator" component={DrawerNavigator} />
    <Tab.Screen name="Activity" component={ActivityScreen} />
  </Tab.Navigator>
);
