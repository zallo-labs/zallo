import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { HomeScreen } from '@features/home/HomeScreen';
import { ReceiveScreen } from '@features/receive/ReceiveScreen';
import { SafeManagementScreen } from '@features/safe-management/SafeManagementScreen';
import { GroupManagementScreen, GroupManagementScreenParams } from '@features/group-management/GroupManagementScreen';

type ParamList = {
  Home: undefined;
  Receive: undefined;
  SafeManagement: undefined;
  GroupManagement: GroupManagementScreenParams;
};

export type RootStackScreenProps<K extends keyof ParamList> =
  NativeStackScreenProps<ParamList, K>;

const Stack = createNativeStackNavigator<ParamList>();

export const RootNavigation = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Receive" component={ReceiveScreen} />
    <Stack.Screen name="SafeManagement" component={SafeManagementScreen} />
    <Stack.Screen name="GroupManagement" component={GroupManagementScreen} />
  </Stack.Navigator>
);
