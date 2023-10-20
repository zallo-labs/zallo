import { SearchParams, useLocalSearchParams } from 'expo-router';
import { asAddress } from 'lib';
import SharedTokenScreen from '~/components/shared/TokenScreen';

export type TokenScreenRoute = `/(drawer)/token/[token]`;
export type TokenScreenParams = SearchParams<TokenScreenRoute>;

export default function TokenScreen() {
  const { token } = useLocalSearchParams<TokenScreenParams>();

  return <SharedTokenScreen token={asAddress(token)} />;
}
