import {
  CalendarIcon,
  CalendarOutlineIcon,
  PayCircleIcon,
  PayCircleOutlineIcon,
  QrCodeIcon,
} from '~/util/theme/icons';
import { ActivityScreen } from '~/screens/activity/ActivityScreen';
import { HomeScreen } from '~/screens/home/HomeScreen';
import { ReceiveScreen } from '~/screens/receive/ReceiveScreen';
import { ComponentPropsWithoutRef, useState } from 'react';
import { BottomNavigation } from 'react-native-paper';
import { DrawerNavigatorScreenProps } from './Drawer/DrawerNavigator';

// TODO: switch to Navigation when updated with RNP 6 support - https://github.com/react-navigation/react-navigation/blob/main/packages/material-bottom-tabs/package.json
import {
  createMaterialBottomTabNavigator,
  MaterialBottomTabScreenProps,
} from '@react-navigation/material-bottom-tabs';

export type BottomNavigatorParamList = {
  Receive: undefined;
  Home: undefined;
  Activity: undefined;
};

export type RootNavigatorScreenProps<K extends keyof BottomNavigatorParamList> =
  MaterialBottomTabScreenProps<BottomNavigatorParamList, K>;

const Navigation = createMaterialBottomTabNavigator<BottomNavigatorParamList>();

export const BottomNavigator = (/*_props: BottomNavigatorProps*/) => (
  <Navigation.Navigator>
    <Navigation.Screen
      name="Receive"
      component={ReceiveScreen}
      options={{ tabBarIcon: QrCodeIcon }}
    />
    <Navigation.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused, ...props }) =>
          focused ? (
            <PayCircleIcon {...props} />
          ) : (
            <PayCircleOutlineIcon {...props} />
          ),
      }}
    />
    <Navigation.Screen
      name="Activity"
      component={ActivityScreen}
      options={{
        tabBarIcon: ({ focused, ...props }) =>
          focused ? (
            <CalendarIcon {...props} />
          ) : (
            <CalendarOutlineIcon {...props} />
          ),
      }}
    />
  </Navigation.Navigator>
);

// type Routes = ComponentPropsWithoutRef<
//   typeof BottomNavigation
// >['navigationState']['routes'];

// const routes: Routes = [
//   {
//     key: 'Receive',
//     title: 'Receive',
//     focusedIcon: 'qrcode',
//     unfocusedIcon: 'qrcode',
//   },
//   {
//     key: 'Home',
//     title: 'Home',
//     focusedIcon: PayCircleIcon,
//     unfocusedIcon: PayCircleOutlineIcon,
//   },
//   {
//     key: 'Activity',
//     title: 'Activity',
//     focusedIcon: 'calendar',
//     unfocusedIcon: 'calendar-outline',
//   },
// ];

// const renderScene = BottomNavigation.SceneMap({
//   Receive: ReceiveScreen,
//   Home: HomeScreen,
//   Activity: ActivityScreen,
// });

export type BottomNavigatorProps =
  DrawerNavigatorScreenProps<'BottomNavigator'>;

// export const BottomNavigator = (/*_props: BottomNavigatorProps*/) => {
//   const [index, setIndex] = useState(1);

//   return (
//     <BottomNavigation
//       navigationState={{ index, routes }}
//       onIndexChange={setIndex}
//       renderScene={renderScene}
//     />
//   );
// };
