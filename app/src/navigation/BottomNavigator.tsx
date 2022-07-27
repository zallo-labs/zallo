// import {
//   createMaterialBottomTabNavigator,
//   MaterialBottomTabScreenProps,
// } from '@react-navigation/material-bottom-tabs';
import { ComponentPropsWithoutRef, useState } from 'react';
import { BottomNavigation } from 'react-native-paper';
import { ReceiveScreen } from '~/screens/receive/ReceiveScreen';

// TODO: switch to Navigation when updated with RNP 6 support - https://github.com/react-navigation/react-navigation/blob/main/packages/material-bottom-tabs/package.json
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

type Routes = ComponentPropsWithoutRef<
  typeof BottomNavigation
>['navigationState']['routes'];

const routes: Routes = [
  {
    key: 'receive',
    title: 'Receive',
    focusedIcon: 'qrcode',
    unfocusedIcon: 'qrcode',
  },
];

export const BottomNavigator = () => {
  const [index, setIndex] = useState(0);

  const renderScene = BottomNavigation.SceneMap({
    Receive: ReceiveScreen,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};
