import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
} from '@react-navigation/material-top-tabs';
import { HomeScreen } from '@features/home/HomeScreen';
import { ActivityScreen } from '@features/activity/ActivityScreen';
import { RootNavigatorScreenProps } from './RootNavigator';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';

export type TabNavigatorParamList = {
  Home: undefined;
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
    initialRouteName="Home"
    tabBar={() => null}
    screenOptions={{ lazy: true }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Activity" component={ActivityScreen} />
  </Tab.Navigator>
);
