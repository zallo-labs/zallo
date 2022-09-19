import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { Box } from '~/components/layout/Box';
import { AddIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { Address } from 'lib';
import { FlatList } from 'react-native';
import { AppbarSearch } from '~/components/Appbar/AppbarSearch';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { FAB } from '~/components/FAB';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { Contact, useContacts } from '~/queries/contacts/useContacts.api';
import { useFuzzySearch } from '@hook/useFuzzySearch';
import { AddrCard } from '~/components/addr/AddrCard';

export interface ContactsScreenParams {
  title?: string;
  onSelect?: (contact: Contact) => void;
  disabled?: Address[];
}

export type ContactsScreenProps = RootNavigatorScreenProps<'Contacts'>;

export const ContactsScreen = ({ route, navigation }: ContactsScreenProps) => {
  const { title, onSelect, disabled } = route.params;
  const styles = useStyles();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const [allContacts] = useContacts();

  const [contacts, searchProps] = useFuzzySearch(allContacts, ['name', 'addr']);

  const create = () => navigation.navigate('Contact', {});

  return (
    <Box flex={1}>
      <AppbarHeader>
        <AppbarBack />
        <AppbarSearch title={title || 'Contacts'} {...searchProps} />
      </AppbarHeader>

      <FlatList
        renderItem={({ item }) => (
          <AddrCard
            addr={item.addr}
            onPress={() => {
              if (onSelect) {
                onSelect(item);
              } else {
                navigation.navigate('Contact', { addr: item.addr });
              }
            }}
            disabled={disabled?.includes(item.addr)}
          />
        )}
        ItemSeparatorComponent={() => <Box my={2} />}
        keyExtractor={(item) => item.addr}
        style={styles.list}
        data={contacts}
        extraData={[navigation, onSelect, disabled]}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
      />

      <FAB icon={AddIcon} label="Add contact" onPress={create} />
    </Box>
  );
};

const useStyles = makeStyles(({ space }) => ({
  list: {
    marginHorizontal: space(2),
  },
}));
