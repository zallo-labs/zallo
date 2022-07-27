import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { ReceiveScreen } from '~/screens/receive/ReceiveScreen';
import { BottomNavigator } from './BottomNavigator';

export type RootNavigatorParamList = {
  // BottomNavigator: undefined;
  Receive: undefined;
};

export type RootNavigatorScreenProps<K extends keyof RootNavigatorParamList> =
  NativeStackScreenProps<RootNavigatorParamList, K>;

const Navigation = createNativeStackNavigator<RootNavigatorParamList>();

export const RootNavigator = () => (
  <Navigation.Navigator screenOptions={{ headerShown: false }}>
    {/* <Navigation.Screen name="BottomNavigator" component={BottomNavigator} /> */}
    <Navigation.Screen name="Receive" component={ReceiveScreen} />
  </Navigation.Navigator>
);
