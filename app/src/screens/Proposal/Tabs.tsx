import { ProposalId } from '@api/proposal';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
} from '@react-navigation/material-top-tabs';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { TopTabBar } from '~/components/TopTabBar';
import { ApprovalsTab, ApprovalsTabParams } from './ApprovalsTab';
import { DetailsTab, DetailsTabParams } from './DetailsTab';
import { ExecutionTab, ExecutionTabParams } from './ExecutionTab';

export type TabNavigatorParamList = {
  Details: DetailsTabParams;
  Approvals: ApprovalsTabParams;
  Execution: ExecutionTabParams;
};

export type TabNavigatorScreenProp<K extends keyof TabNavigatorParamList> =
  MaterialTopTabScreenProps<TabNavigatorParamList, K>;

const Tab = createMaterialTopTabNavigator<TabNavigatorParamList>();

export interface TabsProps {
  proposal: ProposalId;
}

export const Tabs = memo(({ proposal }: TabsProps) => {
  return (
    <Tab.Navigator tabBar={TopTabBar} sceneContainerStyle={styles.sceneContainer}>
      <Tab.Screen name="Details" component={DetailsTab} initialParams={{ proposal }} />
      <Tab.Screen name="Approvals" component={ApprovalsTab} initialParams={{ proposal }} />
      <Tab.Screen name="Execution" component={ExecutionTab} initialParams={{ proposal }} />
    </Tab.Navigator>
  );
});

const styles = StyleSheet.create({
  sceneContainer: {
    marginVertical: 8,
  },
});
