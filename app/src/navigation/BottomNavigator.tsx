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
import {
  createMaterialBottomTabNavigator,
  MaterialBottomTabNavigationProp,
  MaterialBottomTabScreenProps,
} from '@react-navigation/material-bottom-tabs';
import { useTheme } from '@theme/paper';
import { CompositeScreenProps } from '@react-navigation/native';
import { useNotificationsCount } from '~/util/NotificationsRegistrar';
import { StackNavigatorScreenProps } from './StackNavigator';

export type BottomNavigatorParamList = {
  Receive: undefined;
  Home: undefined;
  Activity: undefined;
};

export type BottomNavigatorNavigatonProp =
  MaterialBottomTabNavigationProp<BottomNavigatorParamList>;

export type BottomNavigatorScreenProps<K extends keyof BottomNavigatorParamList> =
  CompositeScreenProps<
    StackNavigatorScreenProps<'BottomNavigator'>,
    MaterialBottomTabScreenProps<BottomNavigatorParamList, K>
  >;

const Navigation = createMaterialBottomTabNavigator<BottomNavigatorParamList>();

export const BottomNavigator = () => {
  const { iconSize } = useTheme();

  return (
    <Navigation.Navigator initialRouteName="Home">
      <Navigation.Screen
        name="Receive"
        component={ReceiveScreen}
        options={{
          tabBarIcon: (props) => <QrCodeIcon size={iconSize.small} {...props} />,
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
          tabBarBadge: useNotificationsCount() || false,
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
