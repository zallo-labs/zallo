import { AddIcon, SearchIcon } from '~/util/theme/icons';
import { Address } from 'lib';
import { FlatList } from 'react-native';
import { Fab } from '~/components/buttons/Fab';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Contact, useContacts } from '@api/contacts';
import { useSearch } from '@hook/useSearch';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { Searchbar } from '~/components/fields/Searchbar';
import { ListHeader } from '~/components/list/ListHeader';
import { ContactItem } from './ContactItem';
import { Screen } from '~/components/layout/Screen';

export interface ContactsScreenParams {
  onSelect?: (contact: Contact) => void;
  disabled?: Set<Address>;
}

export type ContactsScreenProps =
  | StackNavigatorScreenProps<'Contacts'>
  | StackNavigatorScreenProps<'ContactsModal'>;

export const ContactsScreen = withSuspense(
  ({ route, navigation: { navigate } }: ContactsScreenProps) => {
    const { onSelect, disabled } = route.params;

    const [contacts, searchProps] = useSearch(useContacts(), ['name', 'addr']);

    return (
      <Screen withoutTopInset isModal={route.name === 'ContactsModal'}>
        <Searchbar
          leading={AppbarBack2}
          placeholder="Search contacts"
          trailing={SearchIcon}
          {...searchProps}
        />

        <FlatList
          data={contacts}
          ListHeaderComponent={<ListHeader>Contacts</ListHeader>}
          renderItem={({ item: contact }) => (
            <ContactItem
              contact={contact}
              disabled={disabled?.has(contact.addr)}
              onPress={() => {
                onSelect ? onSelect(contact) : navigate('Contact', { address: contact.addr });
              }}
            />
          )}
          extraData={[navigate, onSelect, disabled]}
          showsVerticalScrollIndicator={false}
        />

        <Fab icon={AddIcon} label="Add" onPress={() => navigate('Contact', {})} />
      </Screen>
    );
  },
  ScreenSkeleton,
);
