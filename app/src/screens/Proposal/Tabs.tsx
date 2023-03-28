import { ProposalId } from '@api/proposal';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
  MaterialTopTabBar,
} from '@react-navigation/material-top-tabs';
import { makeStyles } from '@theme/makeStyles';
import { memo } from 'react';
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

const Placeholder = () => null;

export interface TabsProps {
  proposal: ProposalId;
}

export const Tabs = memo(({ proposal }: TabsProps) => {
  const styles = useStyles();

  return (
    <Tab.Navigator
      sceneContainerStyle={styles.sceneContainer}
      screenOptions={{
        tabBarStyle: styles.tabBar,
        // tabBarLabelStyle: styles.label,
        // tabBarInactiveTintColor: styles.inactiveLabel.color,
      }}
    >
      <Tab.Screen name="Details" component={DetailsTab} initialParams={{ proposal }} />
      <Tab.Screen name="Approvals" component={ApprovalsTab} initialParams={{ proposal }} />
      <Tab.Screen name="Execution" component={ExecutionTab} initialParams={{ proposal }} />
    </Tab.Navigator>
  );
});

const useStyles = makeStyles(({ colors }) => ({
  sceneContainer: {
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
