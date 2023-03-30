import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
} from '@react-navigation/material-top-tabs';
import { StyleSheet } from 'react-native';
import { TopTabBar } from '~/components/tab/TopTabBar';
import { ActivityTab, ActivityTabBadge } from './ActivityTab';
import { CollectablesTab } from './CollectablesTab';
import { TokensTab } from './TokensTab';

export type TabNavigatorParamList = {
  Tokens: undefined;
  Collectables: undefined;
  Activity: undefined;
};

export type TabNavigatorScreenProp<K extends keyof TabNavigatorParamList> =
  MaterialTopTabScreenProps<TabNavigatorParamList, K>;

const Tab = createMaterialTopTabNavigator<TabNavigatorParamList>();

export const Tabs = () => {
  return (
    <Tab.Navigator tabBar={TopTabBar} sceneContainerStyle={styles.sceneContainer}>
      <Tab.Screen name="Tokens" component={TokensTab} />
      <Tab.Screen name="Collectables" component={CollectablesTab} />
      <Tab.Screen
        name="Activity"
        component={ActivityTab}
        options={{ tabBarBadge: () => <ActivityTabBadge /> }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  sceneContainer: {
    flex: 1,
    marginVertical: 8,
  },
});
