import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { HomeScreen } from '@features/home/HomeScreen';
import { ReceiveScreen } from '@features/receive/ReceiveScreen';
import { SafeManagementScreen } from '@features/safe-management/SafeManagementScreen';
import {
  GroupManagementScreen,
  GroupManagementScreenParams,
} from '@features/group-management/GroupManagementScreen';
import {
  ContactsScreen,
  ContactsScreenParams,
} from '@features/contacts/ContactsScreen';
import { QrScannerParams, QrScannerScreen } from '@features/qr/QrScannerScreen';
import {
  ContactScreen,
  ContactScreenParams,
} from '@features/contacts/ContactScreen';
import { TabNavigator, TabNavigatorParams } from './TabNavigator';

export type RootNavigatorParamList = {
  TabNavigator: TabNavigatorParams;
  Receive: undefined;
  SafeManagement: undefined;
  GroupManagement: GroupManagementScreenParams;
  // Modal
  Contacts: ContactsScreenParams;
  Contact: ContactScreenParams;
  QrScanner: QrScannerParams;
};

export type RootNavigatorScreenProps<K extends keyof RootNavigatorParamList> =
  NativeStackScreenProps<RootNavigatorParamList, K>;

const Stack = createNativeStackNavigator<RootNavigatorParamList>();

export const RootNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Group>
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen name="Receive" component={ReceiveScreen} />
      <Stack.Screen name="SafeManagement" component={SafeManagementScreen} />
      <Stack.Screen name="GroupManagement" component={GroupManagementScreen} />
    </Stack.Group>

    <Stack.Group screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen name="Contacts" component={ContactsScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="QrScanner" component={QrScannerScreen} />
    </Stack.Group>
  </Stack.Navigator>
);
