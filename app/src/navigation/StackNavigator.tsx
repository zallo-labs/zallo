import {
  createStackNavigator,
  StackNavigationProp,
  StackScreenProps,
  TransitionPresets,
} from '@react-navigation/stack';
import { AccountScreen, AccountScreenParams } from '~/screens/account/AccountScreen';
import { AccountsSheet, AccountsSheetParams } from '~/screens/accounts/AccountsSheet';
import { AddressSheet, AddressSheetScreenParams } from '~/screens/address/AddressSheet';
import { AlertModal, AlertModalParams } from '~/screens/alert/AlertModal';
import { ContactScreen, ContactScreenParams } from '~/screens/contact/ContactScreen';
import { ContactsScreen, ContactsScreenParams } from '~/screens/contacts/ContactsScreen';
import {
  CreateAccountScreen,
  CreateAccountScreenParams,
} from '~/screens/create-account/CreateAccountScreen';
import { HomeScreen, HomeScreenParams } from '~/screens/home/HomeScreen';
import { OnboardScreen } from '~/screens/onboard/OnboardScreen';
import { useShowOnboarding } from '~/screens/onboard/useShowOnboarding';
import { ProposalScreen, ProposalScreenParams } from '~/screens/proposal/ProposalScreen';
import { QrModal, QrModalParams } from '~/screens/qr/QrModal';
import { RenameAccountModal, RenameAccountModalParams } from '~/screens/account/RenameAccountModal';
import { ScanScreen, ScanScreenParams } from '~/screens/scan/ScanScreen';
import { SendScreen, SendScreenParams } from '~/screens/send/SendScreen';
import { SessionsScreen, SessionsScreenParams } from '~/screens/sessions/SessionsScreen';
import { SettingsScreen, SettingsScreenParams } from '~/screens/settings/SettingsScreen';
import { TokensScreen, TokensScreenParams } from '~/screens/tokens/TokensScreen';
import { UserScreen } from '~/screens/user/UserScreen';
import { PolicyScreen, PolicyScreenParams } from '~/screens/policy/PolicyScreen';
import { ContractsModal, ContractsModalParams } from '~/components/Contracts/ContractsModal';
import { ImportSelectorModal } from '../screens/import-selector/ImportSelectorModal';
import {
  RenamePolicyScreen,
  RenamePolicyScreenParams,
} from '~/screens/rename-policy/RenamePolicySheet';
import { ConnectSheet, ConnectSheetParams } from '~/screens/connect/ConnectSheet';
import { PairingSheet, PairingSheetParams } from '~/screens/pairing/PairingSheet';
import {
  NotificationSettingsParams,
  NotificationSettingsScreen,
} from '~/screens/notifications/NotificationSettingsScreen';
import { SwapScreen, SwapScreenParams } from '~/screens/swap/SwapScreen';
import { ApproversScreen, ApproversScreenParams } from '~/screens/approvers/ApproversScreen';
import {
  ContractPermissionsScreen,
  ContractPermissionsScreenParams,
} from '~/screens/contract-permissions/ContractPermissionsScreen';
import { ApproverScreen, ApproverScreenParams } from '~/screens/approver/ApproverScreen';
import { BiometricsScreen, BiometricsScreenParams } from '~/screens/biometrics/BiometricsScreen';
import {
  LinkingTokenModal,
  LinkingTokenModalParams,
} from '~/screens/linking-token/LinkingTokenModal';
import { ConfirmLinkSheet, ConfirmLinkSheetParams } from '~/screens/confirm-link/ConfirmLinkSheet';
import { CreateUserScreen } from '~/screens/create-user/CreateUserScreen';
import { AddressesModal, AddressesModalParams } from '~/screens/addresses/AddressesModal';
import { TokenScreen, TokenScreenParams } from '~/screens/token/TokenScreen';
import { LinkLedgerScreen } from '~/screens/link-ledger/LinkLedgerScreen';
import { LedgerSignSheet, LedgerSignSheetParams } from '~/screens/ledger-sign/LedgerSignSheet';
import {
  MessageProposalScreen,
  MessageProposalScreenParams,
} from '~/screens/message-proposal/MessageProposalScreen';
import { AddPolicyScreen, AddPolicyScreenParams } from '~/screens/add-policy/AddPolicyScreen';

export type StackNavigatorParamList = {
  Home: HomeScreenParams;
  CreateAccount: CreateAccountScreenParams;
  Scan: ScanScreenParams;
  Proposal: ProposalScreenParams;
  MessageProposal: MessageProposalScreenParams;
  Send: SendScreenParams;
  Swap: SwapScreenParams;
  Contacts: ContactsScreenParams;
  Contact: ContactScreenParams;
  Settings: SettingsScreenParams;
  User: undefined;
  Approver: ApproverScreenParams;
  Account: AccountScreenParams;
  AddPolicy: AddPolicyScreenParams;
  Policy: PolicyScreenParams;
  Approvers: ApproversScreenParams;
  ContractPermissions: ContractPermissionsScreenParams;
  Sessions: SessionsScreenParams;
  Biometrics: BiometricsScreenParams;
  Tokens: TokensScreenParams;
  Token: TokenScreenParams;
  NotificationSettings: NotificationSettingsParams;
  LinkLedger: undefined;
  // Onboarding
  Onboard: undefined;
  CreateUser: undefined;
  // Transparent modal
  AccountsSheet: AccountsSheetParams;
  AddressSheet: AddressSheetScreenParams;
  QrModal: QrModalParams;
  LinkingTokenModal: LinkingTokenModalParams;
  ConfirmLinkSheet: ConfirmLinkSheetParams;
  Alert: AlertModalParams;
  ConnectSheet: ConnectSheetParams;
  PairingSheet: PairingSheetParams;
  LedgerSign: LedgerSignSheetParams;
  // Card modal
  RenameAccountModal: RenameAccountModalParams;
  TokensModal: TokensScreenParams;
  ContractsModal: ContractsModalParams;
  ImportSelectorModal: undefined;
  RenamePolicy: RenamePolicyScreenParams;
  AddressesModal: AddressesModalParams;
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

      <Navigation.Screen name="Home" component={HomeScreen} initialParams={{}} />
      <Navigation.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Navigation.Screen name="Scan" component={ScanScreen} />
      <Navigation.Screen name="Proposal" component={ProposalScreen} />
      <Navigation.Screen name="MessageProposal" component={MessageProposalScreen} />
      <Navigation.Screen name="Send" component={SendScreen} />
      <Navigation.Screen name="Swap" component={SwapScreen} />
      <Navigation.Screen name="Contacts" component={ContactsScreen} />
      <Navigation.Screen name="Contact" component={ContactScreen} />
      <Navigation.Screen name="Settings" component={SettingsScreen} />
      <Navigation.Screen name="User" component={UserScreen} />
      <Navigation.Screen name="Approver" component={ApproverScreen} />
      <Navigation.Screen name="Account" component={AccountScreen} />
      <Navigation.Screen name="AddPolicy" component={AddPolicyScreen} />
      <Navigation.Screen name="Policy" component={PolicyScreen} />
      <Navigation.Screen name="Approvers" component={ApproversScreen} />
      <Navigation.Screen name="ContractPermissions" component={ContractPermissionsScreen} />
      <Navigation.Screen name="Sessions" component={SessionsScreen} />
      <Navigation.Screen name="Biometrics" component={BiometricsScreen} />
      <Navigation.Screen name="Tokens" component={TokensScreen} />
      <Navigation.Screen name="Token" component={TokenScreen} />
      <Navigation.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Navigation.Screen name="LinkLedger" component={LinkLedgerScreen} />

      <Navigation.Group screenOptions={{ presentation: 'transparentModal' }}>
        <Navigation.Screen name="AccountsSheet" component={AccountsSheet} />
        <Navigation.Screen name="AddressSheet" component={AddressSheet} />
        <Navigation.Screen name="QrModal" component={QrModal} />
        <Navigation.Screen name="LinkingTokenModal" component={LinkingTokenModal} />
        <Navigation.Screen name="ConfirmLinkSheet" component={ConfirmLinkSheet} />
        <Navigation.Screen name="Alert" component={AlertModal} />
        <Navigation.Screen name="ConnectSheet" component={ConnectSheet} />
        <Navigation.Screen name="PairingSheet" component={PairingSheet} />
        <Navigation.Screen name="LedgerSign" component={LedgerSignSheet} />
      </Navigation.Group>

      <Navigation.Group
        screenOptions={{
          gestureEnabled: true,
          cardOverlayEnabled: true,
          ...TransitionPresets.ModalPresentationIOS,
        }}
      >
        <Navigation.Screen name="RenameAccountModal" component={RenameAccountModal} />
        <Navigation.Screen name="TokensModal" component={TokensScreen} />
        <Navigation.Screen name="ContractsModal" component={ContractsModal} />
        <Navigation.Screen name="ImportSelectorModal" component={ImportSelectorModal} />
        <Navigation.Screen name="RenamePolicy" component={RenamePolicyScreen} />
        <Navigation.Screen name="AddressesModal" component={AddressesModal} />
      </Navigation.Group>
    </Navigation.Navigator>
  );
};
