import { ComponentPropsWithoutRef, useState } from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import { AccountsScreen } from '~/screens/accounts/AccountsScreen';
import { ReceiveScreen } from '~/screens/receive/ReceiveScreen';
import { RootNavigatorScreenProps } from './RootNavigator';

// TODO: switch to Navigation when updated with RNP 6 support - https://github.com/react-navigation/react-navigation/blob/main/packages/material-bottom-tabs/package.json
// import {
//   createMaterialBottomTabNavigator,
//   MaterialBottomTabScreenProps,
// } from '@react-navigation/material-bottom-tabs';

// export type BottomNavigatorParamList = {
//   Receive: undefined;
// };

// export type RootNavigatorScreenProps<K extends keyof BottomNavigatorParamList> =
//   MaterialBottomTabScreenProps<BottomNavigatorParamList, K>;

// const Navigation = createMaterialBottomTabNavigator<BottomNavigatorParamList>();

// export const BottomNavigator = () => (
//   <Navigation.Navigator>
//     <Navigation.Screen name="Receive" component={ReceiveScreen} />
//   </Navigation.Navigator>
// )

const Unimplemented = () => <Text>Unimplemented</Text>;

type Routes = ComponentPropsWithoutRef<
  typeof BottomNavigation
>['navigationState']['routes'];

const routes: Routes = [
  {
    key: 'Pay',
    title: 'Pay',
    focusedIcon: 'contactless-payment-circle',
    unfocusedIcon: 'contactless-payment-circle-outline',
  },
  {
    key: 'Accounts',
    title: 'Accounts',
    focusedIcon: 'view-stream',
    unfocusedIcon: 'view-stream-outline',
  },
  {
    key: 'Activity',
    title: 'Activity',
    focusedIcon: 'calendar',
    unfocusedIcon: 'calendar-outline',
  },
  {
    key: 'Receive',
    title: 'Receive',
    focusedIcon: 'qrcode',
    unfocusedIcon: 'qrcode',
  },
];

const renderScene = BottomNavigation.SceneMap({
  Pay: Unimplemented,
  Accounts: AccountsScreen,
  Activity: Unimplemented,
  Receive: ReceiveScreen,
});

export type BottomNavigatorProps = RootNavigatorScreenProps<'BottomNavigator'>;

export const BottomNavigator = (_props: BottomNavigatorProps) => {
  const [index, setIndex] = useState(1);

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};
