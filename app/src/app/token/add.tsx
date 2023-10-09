import { SearchParams } from 'expo-router';
import { InternalTokenScreen } from '~/app/token/[token]';

export type AddTokenScreenRoute = `/token/add`;
export type AddTokenScreenParams = SearchParams<AddTokenScreenRoute>;

export default function AddTokenScreen() {
  return <InternalTokenScreen />;
}
