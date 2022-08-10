import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { AddIcon } from '@util/theme/icons';
import { useTheme } from '@util/theme/paper';
import { Address } from 'lib';
import { FlatList } from 'react-native';
import { AddrCard } from '~/components2/addr/AddrCard';
import { AppbarSearch } from '~/components2/Appbar/AppbarSearch';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { useFuzzySearch } from '~/components2/Appbar/useFuzzySearch';
import { FAB } from '~/components2/FAB';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { Contact, useContacts } from '~/queries/contacts/useContacts.api';

export interface ContactsScreenParams {
  onSelect?: (contact: Contact) => void;
  disabled?: Address[];
}

export type ContactsScreenProps = RootNavigatorScreenProps<'Contacts'>;

export const ContactsScreen = ({ route, navigation }: ContactsScreenProps) => {
  const { onSelect, disabled } = route.params;
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const { space } = useTheme();
  const { contacts: allContacts } = useContacts();

  const [contacts, searchProps] = useFuzzySearch(allContacts, ['name', 'addr']);

  const create = () => navigation.navigate('Contact', {});

  return (
    <Box flex={1}>
      <AppbarHeader>
        <AppbarBack />
        <AppbarSearch title="Contacts" {...searchProps} />
      </AppbarHeader>

      <FlatList
        renderItem={({ item }) => (
          <AddrCard
            addr={item.addr}
            onPress={() => {
              if (onSelect) {
                onSelect(item);
                navigation.goBack();
              } else {
                navigation.navigate('Contact', { addr: item.addr });
              }
            }}
            disabled={disabled?.includes(item.addr)}
          />
        )}
        ItemSeparatorComponent={() => <Box my={2} />}
        style={{ marginHorizontal: space(3) }}
        data={contacts}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
      />

      <FAB icon={AddIcon} label="Add contact" onPress={create} />
    </Box>
  );
};
