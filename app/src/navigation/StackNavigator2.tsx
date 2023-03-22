import {
  createStackNavigator,
  StackNavigationProp,
  StackScreenProps,
  TransitionPresets,
} from '@react-navigation/stack';
import { CreateAccountScreen } from '~/screens/CreateAccount/CreateAccountScreen';
import { CreateUserScreen } from '~/screens/CreateUser/CreateUserScreen';
import { AccountsSheetScreen } from '~/screens/AccountsSheet/AccountsSheetScreen';
import { HomeScreen } from '~/screens/Home/HomeScreen';
import { OnboardScreen } from '~/screens/Onboard/OnboardScreen';
import { useShowOnboarding } from '~/screens/Onboard/useShowOnboarding';
import { ScanScreen, ScanScreenParams } from '~/screens/Scan/ScanScreen';
import { ProposalScreen, ProposalScreenParams } from '~/screens/Proposal/ProposalScreen2';
import { SendScreen, SendScreenParams } from '~/screens/Send/SendScreen2';
import { ContactsScreen, ContactsScreenParams } from '~/screens/contacts/ContactsScreen';
import {
  AddressSheetScreen,
  AddressSheetScreenParams,
} from '~/screens/AddressSheet/AddressSheetScreen';
import { ContactScreen, ContactScreenParams } from '~/screens/contacts/ContactScreen';
// import { SettingsScreen } from '~/screens/Settings/SettingsScreen';

export type StackNavigatorParamList = {
  // Onboarding
  Onboard: undefined;
  CreateUser: undefined;
  // Home
  Home: undefined;
  AccountsSheet: undefined;
  Scan: ScanScreenParams;
  AddressSheet: AddressSheetScreenParams;
  Proposal: ProposalScreenParams;
  Send: SendScreenParams;
  Contacts: ContactsScreenParams;
  ContactsModal: ContactsScreenParams;
  Contact: ContactScreenParams;
  // Settings
  Settings: undefined;
  // Account
  CreateAccount: undefined;
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
      <Navigation.Screen name="Scan" component={ScanScreen} />
      <Navigation.Screen name="Proposal" component={ProposalScreen} />
      <Navigation.Screen name="Send" component={SendScreen} />
      <Navigation.Screen name="Contacts" component={ContactsScreen} />
      <Navigation.Screen name="Contact" component={ContactScreen} />

      {/* <Navigation.Screen name="Settings" component={SettingsScreen} /> */}

      <Navigation.Screen name="CreateAccount" component={CreateAccountScreen} />

      <Navigation.Group screenOptions={{ presentation: 'transparentModal' }}>
        <Navigation.Screen name="AccountsSheet" component={AccountsSheetScreen} />
        <Navigation.Screen name="AddressSheet" component={AddressSheetScreen} />
      </Navigation.Group>

      <Navigation.Group
        screenOptions={{
          gestureEnabled: true,
          cardOverlayEnabled: true,
          ...TransitionPresets.ModalPresentationIOS,
        }}
      >
        <Navigation.Screen name="ContactsModal" component={ContactsScreen} />
      </Navigation.Group>
    </Navigation.Navigator>
  );
};
