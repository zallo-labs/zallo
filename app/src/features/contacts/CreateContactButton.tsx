import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ContactsScreenProps } from './ContactsScreen';
import { tryAddress } from 'lib';
import { useContacts } from '~/queries/useContacts';

export interface CreateContactButtonProps {
  input: string;
}

export const CreateContactButton = ({ input }: CreateContactButtonProps) => {
  const navigation = useNavigation<ContactsScreenProps['navigation']>();
  const { contacts } = useContacts();

  // Only show button if the address is not already a contact
  const addr = tryAddress(input);
  if (addr && contacts.find((c) => c.addr === addr)) return null;

  return (
    <FAB
      icon="account-plus"
      label="Create"
      onPress={() => navigation.navigate('Contact', { name: input })}
    />
  );
};
