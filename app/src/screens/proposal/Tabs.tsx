import { ProposalId } from '@api/proposal';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
} from '@react-navigation/material-top-tabs';
import { TopTabBar } from '~/components/tab/TopTabBar';
import { PolicyTab, PolicyTabBadge, PolicyTabParams } from './PolicyTab';
import { DetailsTab, DetailsTabParams } from './DetailsTab';
import { TransactionTab, TransactionTabBadge, TransactionTabParams } from './TransactionTab';

export type TabNavigatorParamList = {
  Details: DetailsTabParams;
  Policy: PolicyTabParams;
  Transaction: TransactionTabParams;
};

export type TabNavigatorScreenProp<K extends keyof TabNavigatorParamList> =
  MaterialTopTabScreenProps<TabNavigatorParamList, K>;

const Tab = createMaterialTopTabNavigator<TabNavigatorParamList>();

export interface TabsProps {
  proposal: ProposalId;
}

export const Tabs = ({ proposal }: TabsProps) => (
  <Tab.Navigator tabBar={TopTabBar}>
    <Tab.Screen name="Details" component={DetailsTab} initialParams={{ proposal }} />
    <Tab.Screen
      name="Policy"
      component={PolicyTab}
      options={{ tabBarBadge: () => <PolicyTabBadge proposal={proposal} /> }}
      initialParams={{ proposal }}
    />
    <Tab.Screen
      name="Transaction"
      component={TransactionTab}
      options={{ tabBarBadge: () => <TransactionTabBadge proposal={proposal} /> }}
      initialParams={{ proposal }}
    />
  </Tab.Navigator>
);
