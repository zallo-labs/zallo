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
import {
  TokensScreen,
  TokensScreenParams,
} from '~/screens/tokens/TokensScreen';
import { useAccounts } from '~/queries/accounts/useAccounts';
import { CreateFirstAccountScreen } from '~/screens/onboard/CreateFirstAccountScreen';
import { useMemo } from 'react';

export type RootNavigatorParamList = {
  BottomNavigator: undefined;
  Tokens: TokensScreenParams;
  SelectAccount: undefined;
  Amount: AmountScreenParams;
  // Onboarding
  CreateFirstAccount: undefined;
};

export type RootNavigatorScreenProps<K extends keyof RootNavigatorParamList> =
  NativeStackScreenProps<RootNavigatorParamList, K>;

const Navigation = createNativeStackNavigator<RootNavigatorParamList>();

export const RootNavigator = () => {
  const { accounts } = useAccounts();

  const initialRoute = useMemo((): keyof RootNavigatorParamList => {
    if (accounts.length === 0) return 'CreateFirstAccount';
    return 'BottomNavigator';
  }, [accounts.length]);

  return (
    <Navigation.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Navigation.Screen name="BottomNavigator" component={BottomNavigator} />
      <Navigation.Screen name="Tokens" component={TokensScreen} />
      <Navigation.Screen name="SelectAccount" component={SelectAccountScreen} />
      <Navigation.Screen name="Amount" component={AmountScreen} />

      <Navigation.Group key="Onboarding">
        <Navigation.Screen
          name="CreateFirstAccount"
          component={CreateFirstAccountScreen}
        />
      </Navigation.Group>
    </Navigation.Navigator>
  );
};
