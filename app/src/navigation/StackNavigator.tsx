import {
  createStackNavigator,
  StackNavigationProp,
  StackScreenProps,
  TransitionPresets,
} from '@react-navigation/stack';
import { AmountScreen, AmountScreenParams } from '~/screens/amount/AmountScreen';
import { TokensScreen, TokensScreenParams } from '~/screens/tokens/TokensScreen';
import { ContactsScreen, ContactsScreenParams } from '~/screens/contacts/ContactsScreen';
import { ScanScreen, ScanScreenParams } from '~/screens/scan/ScanScreen';
import {
  CreateAccountScreen,
  CreateAccountScreenParams,
} from '~/screens/create-account/CreateAccountScreen';
import { useShowOnboarding } from '~/screens/Onboard/useShowOnboarding';
import { ContactScreen, ContactScreenParams } from '~/screens/contacts/ContactScreen';
import { AccountScreen, AccountScreenParams } from '~/screens/account/AccountScreen';
import { SendScreen, SendScreenParams } from '~/screens/send/SendScreen';
import {
  SessionProposalScreen,
  SessionProposalScreenParams,
} from '~/screens/session-proposal/SessionProposalScreen';
import { SignScreen, SignScreenParams } from '~/screens/sign/SignScreen';
import { SessionsScreen } from '~/screens/sessions/SessionsScreen';
import ProposalScreen, { ProposalScreenParams } from '~/screens/proposal/ProposalScreen';
import { DeviceScreen } from '~/screens/device/DeviceScreen';
import { OnboardScreen } from '~/screens/Onboard/OnboardScreen';
import {
  NameDeviceScreen,
  NameDeviceScreenParams,
} from '~/screens/create-account/NameDeviceScreen';
import { AccountsScreen, AccountsScreenParams } from '~/screens/accounts/AccountsScreen';
import { SettingsScreen } from '~/screens/settings/SettingsScreen';
import {
  RenameAccountScreen,
  RenameAccountScreenParams,
} from '~/screens/account/rename/RenameAccountScreen';
import { AlertScreen, AlertScreenParams } from '~/screens/alert/AlertScreen';
import { BottomNavigator, BottomNavigatorParams } from './BottomNavigator';
import { PolicyScreen, PolicyScreenParams } from '~/screens/policy/PolicyScreen';

export type StackNavigatorParamList = {
  Onboard: undefined;

  BottomNavigator: BottomNavigatorParams;
  Proposal: ProposalScreenParams;
  Accounts: AccountsScreenParams;
  Account: AccountScreenParams;
  RenameAccount: RenameAccountScreenParams;
  Policy: PolicyScreenParams;
  Contacts: ContactsScreenParams;
  ContactsModal: ContactsScreenParams;
  Contact: ContactScreenParams;
  Scan: ScanScreenParams;
  Tokens: TokensScreenParams;
  TokensModal: TokensScreenParams;
  Amount: AmountScreenParams;
  Send: SendScreenParams;
  Device: undefined;
  CreateAccount: CreateAccountScreenParams;
  NameDevice: NameDeviceScreenParams;
  Settings: undefined;
  // Modal
  Alert: AlertScreenParams;
  // WalletConnect
  Sessions: undefined;
  SessionProposal: SessionProposalScreenParams;
  Sign: SignScreenParams;
};

export type StackNavigatorNavigationProp = StackNavigationProp<StackNavigatorParamList>;

// export type StackNavigatorScreenProps<K extends keyof StackNavigatorParamList> =
//   CompositeScreenProps<
//     DrawerNavigatorScreenProps<'StackNavigator'>,
//     StackScreenProps<StackNavigatorParamList, K>
//   >;

export type StackNavigatorScreenProps<K extends keyof StackNavigatorParamList> = StackScreenProps<
  StackNavigatorParamList,
  K
>;

const Navigation = createStackNavigator<StackNavigatorParamList>();

export const StackNavigator = () => {
  const showOnboarding = useShowOnboarding();

  return (
    <Navigation.Navigator screenOptions={{ headerShown: false }}>
      {showOnboarding && (
        <Navigation.Group>
          <Navigation.Screen name="Onboard" component={OnboardScreen} />
        </Navigation.Group>
      )}

      <Navigation.Screen name="BottomNavigator" component={BottomNavigator} />
      <Navigation.Screen name="Proposal" component={ProposalScreen} />
      <Navigation.Screen name="Accounts" component={AccountsScreen} />
      <Navigation.Screen name="Account" component={AccountScreen} />
      <Navigation.Screen name="RenameAccount" component={RenameAccountScreen} />
      <Navigation.Screen name="Policy" component={PolicyScreen} />
      <Navigation.Screen name="Contacts" component={ContactsScreen} />
      <Navigation.Screen name="Contact" component={ContactScreen} />
      <Navigation.Screen name="Scan" component={ScanScreen} />
      <Navigation.Screen name="Tokens" component={TokensScreen} />
      <Navigation.Screen name="Amount" component={AmountScreen} />
      <Navigation.Screen name="Send" component={SendScreen} />
      <Navigation.Screen name="Device" component={DeviceScreen} />
      <Navigation.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Navigation.Screen name="NameDevice" component={NameDeviceScreen} />
      <Navigation.Screen name="Settings" component={SettingsScreen} />

      <Navigation.Group screenOptions={{ presentation: 'transparentModal' }}>
        <Navigation.Screen name="Alert" component={AlertScreen} />
      </Navigation.Group>

      <Navigation.Group
        screenOptions={{
          gestureEnabled: true,
          cardOverlayEnabled: true,
          ...TransitionPresets.ModalPresentationIOS,
        }}
      >
        <Navigation.Screen name="TokensModal" component={TokensScreen} />
        <Navigation.Screen name="ContactsModal" component={ContactsScreen} />
      </Navigation.Group>

      <Navigation.Group key="WalletConnect">
        <Navigation.Screen name="Sessions" component={SessionsScreen} />
        <Navigation.Screen name="SessionProposal" component={SessionProposalScreen} />
        <Navigation.Screen name="Sign" component={SignScreen} />
      </Navigation.Group>
    </Navigation.Navigator>
  );
};
