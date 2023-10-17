import { SearchParams } from 'expo-router';
import { InternalContactScreen } from '~/app/(drawer)/contacts/[address]';

export type AddContactScreenRoute = `/contacts/add`;
export type AddContactScreenParams = SearchParams<AddContactScreenRoute>;

export default function AddContactScreen() {
  return <InternalContactScreen />;
}
