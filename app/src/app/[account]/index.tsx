import { SearchParams, Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native-paper';

export type AccountScreenRoute = `/[account]/`;
export type AccountScreenParams = SearchParams<AccountScreenRoute>;

export default function AccountScreen() {
  const params = useLocalSearchParams<AccountScreenParams>();

  console.log(params);

  return (
    <>
      <Stack.Screen options={{ headerTitle: params.account }} />

      <Text>Account screen</Text>
    </>
  );
}
