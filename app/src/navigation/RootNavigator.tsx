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
  WalletScreen,
  WalletScreenParams,
} from '~/screens/wallets/WalletScreen';
import {
  QuorumScreen,
  QuorumScreenParams,
} from '~/screens/quorum/QuorumScreen';
import {
  ContactsScreen,
  ContactsScreenParams,
} from '~/screens/contacts/ContactsScreen';
import { ScanScreen, ScanScreenParams } from '~/screens/scan/ScanScreen';
import {
  CreateAccountScreen,
  CreateAccountScreenParams,
} from '~/screens/onboard/CreateAccountScreen';
import { NameScreen } from '~/screens/onboard/Name/NameScreen';
import { useShowOnboarding } from '~/screens/onboard/useShowOnboarding';
import { DrawerNavigator } from './Drawer/DrawerNavigator';
import {
  ContactScreen,
  ContactScreenParams,
} from '~/screens/contacts/ContactScreen';
import { WalletsScreen } from '~/screens/wallets/WalletsScreen';
import {
  AccountsScreen,
  AccountsScreenParams,
} from '~/screens/accounts/AccountsScreen';
import {
  AccountScreen,
  AccountScreenParams,
} from '~/screens/accounts/AccountScreen';
import {
  TransactionScreen,
  TransactionScreenParams,
} from '~/screens/transaction/TransactionScreen';

export type RootNavigatorParamList = {
  DrawerNavigator: undefined;
  Transaction: TransactionScreenParams;
  Accounts: AccountsScreenParams;
  Account: AccountScreenParams;
  Wallets: undefined;
  Wallet: WalletScreenParams;
  Quorum: QuorumScreenParams;
  Contacts: ContactsScreenParams;
  Contact: ContactScreenParams;
  Scan: ScanScreenParams;
  Tokens: TokensScreenParams;
  Amount: AmountScreenParams;
  // Onboarding
  Name: undefined;
  CreateAccount: CreateAccountScreenParams;
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
            initialParams={{
              navigate: (_account, navigate) => navigate('BottomNavigator'),
            }}
          />
        </Navigation.Group>
      )}

      <Navigation.Screen name="DrawerNavigator" component={DrawerNavigator} />
      <Navigation.Screen name="Transaction" component={TransactionScreen} />
      <Navigation.Screen name="Accounts" component={AccountsScreen} />
      <Navigation.Screen name="Account" component={AccountScreen} />
      <Navigation.Screen name="Wallets" component={WalletsScreen} />
      <Navigation.Screen name="Wallet" component={WalletScreen} />
      <Navigation.Screen name="Quorum" component={QuorumScreen} />
      <Navigation.Screen name="Contacts" component={ContactsScreen} />
      <Navigation.Screen name="Contact" component={ContactScreen} />
      <Navigation.Screen name="Scan" component={ScanScreen} />
      <Navigation.Screen name="Tokens" component={TokensScreen} />
      <Navigation.Screen name="Amount" component={AmountScreen} />
    </Navigation.Navigator>
  );
};
