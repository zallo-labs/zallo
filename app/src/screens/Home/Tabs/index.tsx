import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
  MaterialTopTabBar,
} from '@react-navigation/material-top-tabs';
import { makeStyles } from '@theme/makeStyles';
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
  const styles = useStyles();

  return (
    <Tab.Navigator
      sceneContainerStyle={styles.sceneContainer}
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarInactiveTintColor: styles.inactiveLabel.color,
      }}
    >
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

const useStyles = makeStyles(({ colors }) => ({
  sceneContainer: {
    flex: 1,
    marginVertical: 8,
  },
  tabBar: {
    backgroundColor: colors.surface,
  },
  label: {
    color: colors.primary,
  },
  inactiveLabel: {
    color: colors.onSurfaceVariant,
  },
}));
