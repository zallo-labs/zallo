import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { AmountScreen, AmountScreenParams } from '~/screens/amount/AmountScreen';
import TokensScreen, { TokensScreenParams } from '~/screens/tokens/TokensScreen';
import ContactsScreen, { ContactsScreenParams } from '~/screens/contacts/ContactsScreen';
import { ScanScreen, ScanScreenParams } from '~/screens/scan/ScanScreen';
import {
  CreateAccountScreen,
  CreateAccountScreenParams,
} from '~/screens/create-account/CreateAccountScreen';
import { useShowOnboarding } from '~/screens/onboard/useShowOnboarding';
import { DrawerNavigator } from './Drawer/DrawerNavigator';
import { ContactScreen, ContactScreenParams } from '~/screens/contacts/ContactScreen';
import { AccountsScreen, AccountsScreenParams } from '~/screens/accounts/AccountsScreen';
import { AccountScreen, AccountScreenParams } from '~/screens/account/AccountScreen';
import { AlertModalScreen, AlertModalScreenParams } from '~/screens/alert/AlertModalScreen';
import { DeleteModalScreen, DeleteModalScreenParams } from '~/screens/alert/DeleteModalScreen';
import { SendScreen, SendScreenParams } from '~/screens/send/SendScreen';
import LimitScreen, { LimitScreenParams } from '~/screens/limit/LimitScreen';
import UserScreen, { UserScreenParams } from '~/screens/user/UserScreen';
import {
  AccountSettingsScreen,
  AccountSettingsScreenParams,
} from '~/screens/account-settings/AccountSettingsScreen';
import {
  SessionProposalScreen,
  SessionProposalScreenParams,
} from '~/screens/session-proposal/SessionProposalScreen';
import { SignScreen, SignScreenParams } from '~/screens/sign/SignScreen';
import { SessionsScreen } from '~/screens/sessions/SessionsScreen';
import ProposalScreen, { ProposalScreenParams } from '~/screens/proposal/ProposalScreen';
import { DeviceScreen } from '~/screens/device/DeviceScreen';
import { OnboardScreen } from '~/screens/onboard/OnboardScreen';
import {
  NameDeviceScreen,
  NameDeviceScreenParams,
} from '~/screens/create-account/NameDeviceScreen';

export type RootNavigatorParamList = {
  DrawerNavigator: undefined;
  Proposal: ProposalScreenParams;
  Accounts: AccountsScreenParams;
  Account: AccountScreenParams;
  AccountSettings: AccountSettingsScreenParams;
  User: UserScreenParams;
  Limit: LimitScreenParams;
  Contacts: ContactsScreenParams;
  Contact: ContactScreenParams;
  Scan: ScanScreenParams;
  Tokens: TokensScreenParams;
  Amount: AmountScreenParams;
  Send: SendScreenParams;
  Device: undefined;
  Onboard: undefined;
  CreateAccount: CreateAccountScreenParams;
  NameDevice: NameDeviceScreenParams;
  // Modal
  Alert: AlertModalScreenParams;
  Delete: DeleteModalScreenParams;
  /* WalletConnect */
  Sessions: undefined;
  SessionProposal: SessionProposalScreenParams;
  Sign: SignScreenParams;
};

export type RootNavigatorScreenProps<K extends keyof RootNavigatorParamList> =
  NativeStackScreenProps<RootNavigatorParamList, K>;

const Navigation = createNativeStackNavigator<RootNavigatorParamList>();

export const RootNavigator = () => {
  const showOnboarding = useShowOnboarding();
  return (
    <Navigation.Navigator screenOptions={{ headerShown: false }}>
      {showOnboarding && <Navigation.Screen name="Onboard" component={OnboardScreen} />}

      <Navigation.Screen name="DrawerNavigator" component={DrawerNavigator} />
      <Navigation.Screen name="Proposal" component={ProposalScreen} />
      <Navigation.Screen name="Accounts" component={AccountsScreen} />
      <Navigation.Screen name="Account" component={AccountScreen} />
      <Navigation.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Navigation.Screen name="User" component={UserScreen} />
      <Navigation.Screen name="Limit" component={LimitScreen} />
      <Navigation.Screen name="Contacts" component={ContactsScreen} />
      <Navigation.Screen name="Contact" component={ContactScreen} />
      <Navigation.Screen name="Scan" component={ScanScreen} />
      <Navigation.Screen name="Tokens" component={TokensScreen} />
      <Navigation.Screen name="Amount" component={AmountScreen} />
      <Navigation.Screen name="Send" component={SendScreen} />
      <Navigation.Screen name="Device" component={DeviceScreen} />
      <Navigation.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Navigation.Screen name="NameDevice" component={NameDeviceScreen} />

      <Navigation.Group screenOptions={{ presentation: 'transparentModal' }}>
        <Navigation.Screen name="Alert" component={AlertModalScreen} />
        <Navigation.Screen name="Delete" component={DeleteModalScreen} />
      </Navigation.Group>

      <Navigation.Group key="WalletConnect">
        <Navigation.Screen name="Sessions" component={SessionsScreen} />
        <Navigation.Screen name="SessionProposal" component={SessionProposalScreen} />
        <Navigation.Screen name="Sign" component={SignScreen} />
      </Navigation.Group>
    </Navigation.Navigator>
  );
};
