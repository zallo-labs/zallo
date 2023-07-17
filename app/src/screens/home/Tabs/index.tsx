import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
} from '@react-navigation/material-top-tabs';
import { TopTabBar } from '~/components/tab/TopTabBar';
import { showInfo } from '~/provider/SnackbarProvider';
import { ActivityTab, ActivityTabParams } from './ActivityTab';
import { CollectablesTab } from './CollectablesTab';
import { TokensTab, TokensTabParams } from './TokensTab';
import { Address } from 'lib';
import { ActivityTabBadge } from './ActivityTabBadge';

export type TabNavigatorParamList = {
  Tokens: TokensTabParams;
  Collectables: undefined;
  Activity: ActivityTabParams;
};

export type TabNavigatorScreenProp<K extends keyof TabNavigatorParamList> =
  MaterialTopTabScreenProps<TabNavigatorParamList, K>;

const Tab = createMaterialTopTabNavigator<TabNavigatorParamList>();

export interface TabsProps {
  account: Address;
}

export const Tabs = ({ account }: TabsProps) => {
  return (
    <Tab.Navigator tabBar={TopTabBar}>
      <Tab.Screen name="Tokens" component={TokensTab} initialParams={{ account }} />
      <Tab.Screen
        name="Collectables"
        component={CollectablesTab}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            showInfo('Collectables are coming soon!');
          },
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityTab}
        initialParams={{ account }}
        options={{ tabBarBadge: () => <ActivityTabBadge account={account} /> }}
      />
    </Tab.Navigator>
  );
};
