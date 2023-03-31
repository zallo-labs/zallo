import { useMemo } from 'react';
import { FlatList } from 'react-native';
import { NavigateNextIcon, ScanIcon, SearchIcon } from '~/util/theme/icons';
import { Address } from 'lib';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';
import { Contact, useContacts } from '@api/contacts';
import { useSearch } from '@hook/useSearch';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { Searchbar } from '~/components/fields/Searchbar';
import { ListHeader } from '~/components/list/ListHeader';
import { Screen } from '~/components/layout/Screen';
import { truncateAddr } from '~/util/format';
import { ListItem } from '~/components/list/ListItem';
import { useScanAddress } from '../Scan/useScanAddress';
import { ListHeaderButton } from '~/components/list/ListHeaderButton';
import { CONTACT_EMITTER } from './useSelectContact';

export interface ContactsScreenParams {
  emitOnSelect?: boolean;
  disabled?: Set<Address>;
}

export type ContactsScreenProps =
  | StackNavigatorScreenProps<'Contacts'>
  | StackNavigatorScreenProps<'ContactsModal'>;

export const ContactsScreen = withSuspense(
  ({ route, navigation: { navigate } }: ContactsScreenProps) => {
    const { emitOnSelect, disabled } = route.params;
    const scanAddress = useScanAddress();

    const [contacts, searchProps] = useSearch(useContacts(), ['name', 'address']);

    const add = () => navigate('Contact', {});
    const scan = async () => navigate('Contact', { address: await scanAddress() });

    const onSelect: (c: Contact) => void = useMemo(
      () =>
        emitOnSelect
          ? (c) => CONTACT_EMITTER.emit(c)
          : ({ address }) => navigate('Contact', { address }),
      [navigate, emitOnSelect],
    );

    return (
      <Screen>
        <Searchbar
          leading={AppbarBack2}
          placeholder="Search contacts"
          trailing={[SearchIcon, (props) => <ScanIcon {...props} onPress={scan} />]}
          inset={route.name === 'Contacts'}
          {...searchProps}
        />

        <FlatList
          data={contacts}
          ListHeaderComponent={
            <ListHeader trailing={<ListHeaderButton onPress={add}>Add</ListHeaderButton>}>
              Contacts
            </ListHeader>
          }
          renderItem={({ item: contact }) => (
            <ListItem
              leading={contact.address}
              headline={contact.name}
              supporting={truncateAddr(contact.address)}
              trailing={NavigateNextIcon}
              disabled={disabled?.has(contact.address)}
              onPress={() => onSelect(contact)}
            />
          )}
          extraData={[navigate, onSelect, disabled]}
          showsVerticalScrollIndicator={false}
        />
      </Screen>
    );
  },
  ScreenSkeleton,
);
