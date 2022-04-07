import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import { HomeScreen } from '@features/home/HomeScreen';

type ParamList = {
  Home: undefined;
};

export type RootStackScreenProps<K extends keyof ParamList> = NativeStackScreenProps<ParamList, K>;

const Stack = createNativeStackNavigator<ParamList>();

export const RootNavigation = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
);
