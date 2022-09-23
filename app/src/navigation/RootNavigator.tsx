import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  AmountScreen,
  AmountScreenParams,
} from '~/screens/amount/AmountScreen';
import {
  TokensScreen,
  TokensScreenParams,
} from '~/screens/tokens/TokensScreen';
import {
  ContactsScreen,
  ContactsScreenParams,
} from '~/screens/contacts/ContactsScreen';
import { ScanScreen, ScanScreenParams } from '~/screens/scan/ScanScreen';
import {
  CreateAccountScreen,
  CreateAccountScreenParams,
} from '~/screens/onboard/CreateAccountScreen';
import { useShowOnboarding } from '~/screens/onboard/useShowOnboarding';
import { DrawerNavigator } from './Drawer/DrawerNavigator';
import {
  ContactScreen,
  ContactScreenParams,
} from '~/screens/contacts/ContactScreen';
import {
  AccountsScreen,
  AccountsScreenParams,
} from '~/screens/accounts/AccountsScreen';
import {
  AccountScreen,
  AccountScreenParams,
} from '~/screens/account/AccountScreen';
import {
  TransactionScreen,
  TransactionScreenParams,
} from '~/screens/transaction/TransactionScreen';
import {
  AlertModalScreen,
  AlertModalScreenParams,
} from '~/screens/alert/AlertModalScreen';
import {
  DeleteModalScreen,
  DeleteModalScreenParams,
} from '~/screens/alert/DeleteModalScreen';
import { SendScreen, SendScreenParams } from '~/screens/send/SendScreen';
import LimitScreen, { LimitScreenParams } from '~/screens/limit/LimitScreen';
import UserScreen, { UserScreenParams } from '~/screens/user/UserScreen';

export type RootNavigatorParamList = {
  DrawerNavigator: undefined;
  Transaction: TransactionScreenParams;
  Accounts: AccountsScreenParams;
  Account: AccountScreenParams;
  User: UserScreenParams;
  Limit: LimitScreenParams;
  Contacts: ContactsScreenParams;
  Contact: ContactScreenParams;
  Scan: ScanScreenParams;
  Tokens: TokensScreenParams;
  Amount: AmountScreenParams;
  Send: SendScreenParams;
  // Onboarding
  CreateAccount: CreateAccountScreenParams;
  // Modal
  Alert: AlertModalScreenParams;
  Delete: DeleteModalScreenParams;
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
          <Navigation.Screen
            name="CreateAccount"
            component={CreateAccountScreen}
            initialParams={{
              onCreate: (_, { navigate }) => navigate('DrawerNavigator'),
            }}
          />
        </Navigation.Group>
      )}

      <Navigation.Screen name="DrawerNavigator" component={DrawerNavigator} />
      <Navigation.Screen name="Transaction" component={TransactionScreen} />
      <Navigation.Screen name="Accounts" component={AccountsScreen} />
      <Navigation.Screen name="Account" component={AccountScreen} />
      {!showOnboarding && (
        <Navigation.Screen
          name="CreateAccount"
          component={CreateAccountScreen}
        />
      )}
      <Navigation.Screen name="User" component={UserScreen} />
      <Navigation.Screen name="Limit" component={LimitScreen} />
      <Navigation.Screen name="Contacts" component={ContactsScreen} />
      <Navigation.Screen name="Contact" component={ContactScreen} />
      <Navigation.Screen name="Scan" component={ScanScreen} />
      <Navigation.Screen name="Tokens" component={TokensScreen} />
      <Navigation.Screen name="Amount" component={AmountScreen} />
      <Navigation.Screen name="Send" component={SendScreen} />

      <Navigation.Group screenOptions={{ presentation: 'transparentModal' }}>
        <Navigation.Screen name="Alert" component={AlertModalScreen} />
        <Navigation.Screen name="Delete" component={DeleteModalScreen} />
      </Navigation.Group>
    </Navigation.Navigator>
  );
};
