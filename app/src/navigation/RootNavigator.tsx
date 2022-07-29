import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { SelectAccountScreen } from '~/screens/select-account/SelectAccountScreen';
import {
  AmountScreen,
  AmountScreenParams,
} from '~/screens/amount/AmountScreen';
import { BottomNavigator } from './BottomNavigator';

export type RootNavigatorParamList = {
  BottomNavigator: undefined;
  SelectAccount: undefined;
  Amount: AmountScreenParams;
};

export type RootNavigatorScreenProps<K extends keyof RootNavigatorParamList> =
  NativeStackScreenProps<RootNavigatorParamList, K>;

const Navigation = createNativeStackNavigator<RootNavigatorParamList>();

export const RootNavigator = () => (
  <Navigation.Navigator screenOptions={{ headerShown: false }}>
    <Navigation.Screen name="BottomNavigator" component={BottomNavigator} />
    <Navigation.Screen name="SelectAccount" component={SelectAccountScreen} />
    <Navigation.Screen name="Amount" component={AmountScreen} />
  </Navigation.Navigator>
);
