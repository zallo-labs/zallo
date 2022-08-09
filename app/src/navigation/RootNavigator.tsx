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
import {
  AccountScreen,
  AccountScreenParams,
} from '~/screens/account/AccountScreen';
import {
  ConfigureScreen,
  ConfigureScreenParams,
} from '~/screens/configure/ConfigureScreen';
import {
  QuorumScreen,
  QuorumScreenParams,
} from '~/screens/quorum/QuorumScreen';
import {
  ContactsScreen,
  ContactsScreenParams,
} from '~/screens/contacts/ContactsScreen';
import { ScanScreen, ScanScreenParams } from '~/screens/scan/ScanScreen';

export type RootNavigatorParamList = {
  BottomNavigator: undefined;
  Tokens: TokensScreenParams;
  SelectAccount: undefined;
  Amount: AmountScreenParams;
  Account: AccountScreenParams;
  Configure: ConfigureScreenParams;
  Quorum: QuorumScreenParams;
  Contacts: ContactsScreenParams;
  Scan: ScanScreenParams;
  // Onboarding
  CreateFirstAccount: undefined;
};

export type RootNavigatorScreenProps<K extends keyof RootNavigatorParamList> =
  NativeStackScreenProps<RootNavigatorParamList, K>;

const Navigation = createNativeStackNavigator<RootNavigatorParamList>();

export const RootNavigator = () => {
  const { accounts } = useAccounts();

  return (
    <Navigation.Navigator screenOptions={{ headerShown: false }}>
      <Navigation.Group key="Onboarding">
        {accounts.length === 0 && (
          <Navigation.Screen
            name="CreateFirstAccount"
            component={CreateFirstAccountScreen}
          />
        )}
      </Navigation.Group>

      <Navigation.Screen name="BottomNavigator" component={BottomNavigator} />
      <Navigation.Screen name="Tokens" component={TokensScreen} />
      <Navigation.Screen name="SelectAccount" component={SelectAccountScreen} />
      <Navigation.Screen name="Amount" component={AmountScreen} />
      <Navigation.Screen name="Account" component={AccountScreen} />
      <Navigation.Screen name="Configure" component={ConfigureScreen} />
      <Navigation.Screen name="Quorum" component={QuorumScreen} />
      <Navigation.Screen name="Contacts" component={ContactsScreen} />
      <Navigation.Screen name="Scan" component={ScanScreen} />
    </Navigation.Navigator>
  );
};
