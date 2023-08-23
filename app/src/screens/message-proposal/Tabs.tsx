import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
} from '@react-navigation/material-top-tabs';
import { TopTabBar } from '~/components/tab/TopTabBar';
import { Hex } from 'lib';
import { MessageDetailsTab, MessageDetailsTabParams } from './MessageDetailsTab';
import { PolicyTab, PolicyTabParams } from '../proposal/PolicyTab';

export type TabNavigatorParamList = {
  MessageDetails: MessageDetailsTabParams;
  Policy: PolicyTabParams;
};

export type TabNavigatorScreenProp<K extends keyof TabNavigatorParamList> =
  MaterialTopTabScreenProps<TabNavigatorParamList, K>;

const Tab = createMaterialTopTabNavigator<TabNavigatorParamList>();

export interface TabsProps {
  proposal: Hex;
}

export const Tabs = ({ proposal }: TabsProps) => (
  <Tab.Navigator tabBar={TopTabBar}>
    <Tab.Screen
      name="MessageDetails"
      component={MessageDetailsTab}
      options={{ title: 'Details' }}
      initialParams={{ proposal }}
    />
    <Tab.Screen name="Policy" component={PolicyTab} initialParams={{ proposal }} />
  </Tab.Navigator>
);
