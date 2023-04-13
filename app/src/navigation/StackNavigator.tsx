import {
  createStackNavigator,
  StackNavigationProp,
  StackScreenProps,
  TransitionPresets,
} from '@react-navigation/stack';
import { AccountScreen, AccountScreenParams } from '~/screens/account/AccountScreen';
import { AccountsSheet } from '~/screens/accounts/AccountsSheet';
import { AddressSheet, AddressSheetScreenParams } from '~/screens/address/AddressSheet';
import { AlertModal, AlertModalParams } from '~/screens/alert/AlertModal';
import { ContactScreen, ContactScreenParams } from '~/screens/contact/ContactScreen';
import { ContactsScreen, ContactsScreenParams } from '~/screens/contacts/ContactsScreen';
import { CreateAccountScreen } from '~/screens/create-account/CreateAccountScreen';
import { CreateUserScreen } from '~/screens/create-user/CreateUserScreen';
import { HomeScreen } from '~/screens/home/HomeScreen';
import { OnboardScreen } from '~/screens/onboard/OnboardScreen';
import { useShowOnboarding } from '~/screens/onboard/useShowOnboarding';
import { ProposalScreen, ProposalScreenParams } from '~/screens/proposal/ProposalScreen';
import { QrModal, QrModalParams } from '~/screens/qr/QrModal';
import { RenameAccountModal, RenameAccountModalParams } from '~/screens/account/RenameAccountModal';
import { ScanScreen, ScanScreenParams } from '~/screens/scan/ScanScreen';
import { SendScreen, SendScreenParams } from '~/screens/send/SendScreen';
import { SessionsScreen } from '~/screens/sessions/SessionsScreen';
import { SettingsScreen } from '~/screens/settings/SettingsScreen';
import { TokensScreen, TokensScreenParams } from '~/screens/tokens/TokensScreen';
import { UserScreen } from '~/screens/user/UserScreen';
import { PolicyScreen, PolicyScreenParams } from '~/screens/policy/PolicyScreen';
import {
  InteractionsScreen,
  InteractionsScreenParams,
} from '~/screens/interactions/InteractionsScreen';
import { ContractsModal, ContractsModalParams } from '~/components/Contracts/ContractsModal';
import { ImportSelectorModal } from '../screens/import-selector/ImportSelectorModal';
import { SignScreen, SignScreenParams } from '~/screens/sign/SignScreen';
import {
  SessionProposalScreen,
  SessionProposalScreenParams,
} from '~/screens/session-proposal/SessionProposalScreen';

export type StackNavigatorParamList = {
  Home: undefined;
  CreateAccount: undefined;
  Scan: ScanScreenParams;
  Proposal: ProposalScreenParams;
  Send: SendScreenParams;
  Contacts: ContactsScreenParams;
  Contact: ContactScreenParams;
  Settings: undefined;
  User: undefined;
  Account: AccountScreenParams;
  Policy: PolicyScreenParams;
  Interactions: InteractionsScreenParams;
  Sessions: undefined;
  Tokens: TokensScreenParams;
  // Onboarding
  Onboard: undefined;
  CreateUser: undefined;
  // Account
  // Transparent modal
  AccountsSheet: undefined;
  AddressSheet: AddressSheetScreenParams;
  QrModal: QrModalParams;
  Alert: AlertModalParams;
  // Card modal
  RenameAccountModal: RenameAccountModalParams;
  ContactsModal: ContactsScreenParams;
  TokensModal: TokensScreenParams;
  ContractsModal: ContractsModalParams;
  ImportSelectorModal: undefined;
  SessionProposal: SessionProposalScreenParams;
  Sign: SignScreenParams;
};

export type StackNavigatorNavigationProp = StackNavigationProp<StackNavigatorParamList>;

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
          <Navigation.Screen name="CreateUser" component={CreateUserScreen} />
        </Navigation.Group>
      )}

      <Navigation.Screen name="Home" component={HomeScreen} />
      <Navigation.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Navigation.Screen name="Scan" component={ScanScreen} />
      <Navigation.Screen name="Proposal" component={ProposalScreen} />
      <Navigation.Screen name="Send" component={SendScreen} />
      <Navigation.Screen name="Contacts" component={ContactsScreen} />
      <Navigation.Screen name="Contact" component={ContactScreen} />
      <Navigation.Screen name="Settings" component={SettingsScreen} />
      <Navigation.Screen name="User" component={UserScreen} />
      <Navigation.Screen name="Account" component={AccountScreen} />
      <Navigation.Screen name="Policy" component={PolicyScreen} />
      <Navigation.Screen name="Interactions" component={InteractionsScreen} />
      <Navigation.Screen name="Sessions" component={SessionsScreen} />
      <Navigation.Screen name="Tokens" component={TokensScreen} />

      <Navigation.Group screenOptions={{ presentation: 'transparentModal' }}>
        <Navigation.Screen name="AccountsSheet" component={AccountsSheet} />
        <Navigation.Screen name="AddressSheet" component={AddressSheet} />
        <Navigation.Screen name="QrModal" component={QrModal} />
        <Navigation.Screen name="Alert" component={AlertModal} />
      </Navigation.Group>

      <Navigation.Group
        screenOptions={{
          gestureEnabled: true,
          cardOverlayEnabled: true,
          ...TransitionPresets.ModalPresentationIOS,
        }}
      >
        <Navigation.Screen name="RenameAccountModal" component={RenameAccountModal} />
        <Navigation.Screen name="ContactsModal" component={ContactsScreen} />
        <Navigation.Screen name="TokensModal" component={TokensScreen} />
        <Navigation.Screen name="ContractsModal" component={ContractsModal} />
        <Navigation.Screen name="ImportSelectorModal" component={ImportSelectorModal} />
        <Navigation.Screen name="SessionProposal" component={SessionProposalScreen} />
        <Navigation.Screen name="Sign" component={SignScreen} />
      </Navigation.Group>
    </Navigation.Navigator>
  );
};
