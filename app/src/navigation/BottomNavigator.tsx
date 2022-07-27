import {
  createMaterialBottomTabNavigator,
  MaterialBottomTabScreenProps,
} from '@react-navigation/material-bottom-tabs';
import { ReceiveScreen } from '~/screens/ReceiveScreen';

export type BottomNavigatorParamList = {
  Receive: undefined;
};

export type RootNavigatorScreenProps<K extends keyof BottomNavigatorParamList> =
  MaterialBottomTabScreenProps<BottomNavigatorParamList, K>;

const Navigator = createMaterialBottomTabNavigator<BottomNavigatorParamList>();

export const BottomNavigator = () => (
  <Navigator.Navigator>
    <Navigator.Screen name="Receive" component={ReceiveScreen} />
  </Navigator.Navigator>
)


