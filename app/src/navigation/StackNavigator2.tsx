import {
  createStackNavigator,
  StackNavigationProp,
  StackScreenProps,
  TransitionPresets,
} from '@react-navigation/stack';
import { CreateAccountScreen } from '~/screens/CreateAccount/CreateAccountScreen';
import { CreateUserScreen } from '~/screens/CreateUser/CreateUserScreen';
import { HomeScreen, HomeScreenParams } from '~/screens/Home/HomeScreen';
import { OnboardScreen } from '~/screens/Onboard/OnboardScreen';
import { useShowOnboarding } from '~/screens/Onboard/useShowOnboarding';
import { ScanScreen, ScanScreenParams } from '~/screens/Scan/ScanScreen';

export type StackNavigatorParamList = {
  // Onboarding
  Onboard: undefined;
  CreateUser: undefined;
  // Home
  Home: HomeScreenParams;
  Scan: ScanScreenParams;
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

      <Navigation.Screen name="CreateAccount" component={CreateAccountScreen} />
    </Navigation.Navigator>
  );
};
