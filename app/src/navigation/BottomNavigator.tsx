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
import { DrawerNavigatorScreenProps } from './Drawer/DrawerNavigator';
import {
  createMaterialBottomTabNavigator,
  MaterialBottomTabScreenProps,
} from '@react-navigation/material-bottom-tabs';
import { useTheme } from '@theme/paper';
import { CompositeScreenProps } from '@react-navigation/native';

export type BottomNavigatorParamList = {
  Receive: undefined;
  Home: undefined;
  Activity: undefined;
};

export type BottomNavigatorScreenProps<
  K extends keyof BottomNavigatorParamList,
> = CompositeScreenProps<
  DrawerNavigatorScreenProps<'BottomNavigator'>,
  MaterialBottomTabScreenProps<BottomNavigatorParamList, K>
>;

const Navigation = createMaterialBottomTabNavigator<BottomNavigatorParamList>();

export const BottomNavigator = () => {
  const { iconSize } = useTheme();

  return (
    <Navigation.Navigator>
      <Navigation.Screen
        name="Receive"
        component={ReceiveScreen}
        options={{
          tabBarIcon: (props) => (
            <QrCodeIcon size={iconSize.small} {...props} />
          ),
        }}
      />
      <Navigation.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, ...props }) =>
            focused ? (
              <PayCircleIcon size={iconSize.small} {...props} />
            ) : (
              <PayCircleOutlineIcon size={iconSize.small} {...props} />
            ),
        }}
      />
      <Navigation.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarIcon: ({ focused, ...props }) =>
            focused ? (
              <CalendarIcon size={iconSize.small} {...props} />
            ) : (
              <CalendarOutlineIcon size={iconSize.small} {...props} />
            ),
        }}
      />
    </Navigation.Navigator>
  );
};
