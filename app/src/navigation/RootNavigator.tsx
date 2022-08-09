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
import { CreateAccountScreen } from '~/screens/onboard/CreateAccountScreen';
import { NameScreen } from '~/screens/onboard/Name/NameScreen';
import { useShowOnboarding } from '~/screens/onboard/useShowOnboarding';

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
  Name: undefined;
  CreateAccount: undefined;
};

export type RootNavigatorScreenProps<K extends keyof RootNavigatorParamList> =
  NativeStackScreenProps<RootNavigatorParamList, K>;

const Navigation = createNativeStackNavigator<RootNavigatorParamList>();

export const RootNavigator = () => {
  const showOnboarding = useShowOnboarding();
  return (
    <Navigation.Navigator screenOptions={{ headerShown: false }}>
      {showOnboarding && (
        <Navigation.Group key="Onboarding">
          <Navigation.Screen name="Name" component={NameScreen} />
          <Navigation.Screen
            name="CreateAccount"
            component={CreateAccountScreen}
          />
        </Navigation.Group>
      )}

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
