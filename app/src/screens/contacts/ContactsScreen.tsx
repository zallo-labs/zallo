import { Box } from '~/components/layout/Box';
import { CheckIcon, PlusIcon, SearchIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { Address } from 'lib';
import { FlatList } from 'react-native';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { Fab } from '~/components/Fab/Fab';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Contact, useContacts } from '~/queries/contacts/useContacts.api';
import { useSearch } from '@hook/useSearch';
import { useState } from 'react';
import { Appbar, Text, TextInput } from 'react-native-paper';
import produce from 'immer';
import { TextField } from '~/components/fields/TextField';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { ContactItem } from './ContactItem';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { AppbarBack } from '~/components/Appbar/AppbarBack';

export interface ContactsScreenParams {
  title?: string;
  disabled?: Set<Address>;
  onSelect?: (contact: Contact) => void;
  selected?: Set<Address>;
  onMultiSelect?: (contacts: Set<Address>) => void;
}

export type ContactsScreenProps =
  | StackNavigatorScreenProps<'Contacts'>
  | StackNavigatorScreenProps<'ContactsModal'>;

export const ContactsScreen = withSkeleton(
  ({ route, navigation: { navigate } }: ContactsScreenProps) => {
    const { title, disabled, onSelect, onMultiSelect } = route.params;
    const styles = useStyles();
    const { AppbarHeader, handleScroll } = useAppbarHeader();
    const [allContacts] = useContacts();
    const [contacts, searchProps] = useSearch(allContacts, ['name', 'addr']);

    const [selections, setSelections] = useState<Set<Address>>(
      () => route.params.selected ?? new Set(),
    );

    const create = () => navigate('Contact', {});

    return (
      <Box flex={1}>
        <AppbarHeader>
          {onSelect || onMultiSelect ? <AppbarBack /> : <AppbarMenu />}
          <Appbar.Content title="" />
          <Appbar.Action icon={PlusIcon} onPress={create} />
        </AppbarHeader>

        <Text variant="headlineSmall" style={{ marginLeft: 16, marginBottom: 16 }}>
          {title || 'Contacts'}
        </Text>

        <FlatList
          ListHeaderComponent={
            <TextField
              left={<TextInput.Icon icon={SearchIcon} />}
              label="Search"
              {...searchProps}
            />
          }
          renderItem={({ item }) => (
            <ContactItem
              contact={item}
              onPress={() => {
                if (onSelect) {
                  onSelect(item);
                } else if (onMultiSelect) {
                  setSelections(
                    produce((selections) => {
                      if (!selections.delete(item.addr)) selections.add(item.addr);
                    }),
                  );
                } else {
                  navigate('Contact', { addr: item.addr });
                }
              }}
              selected={selections.has(item.addr)}
              disabled={disabled?.has(item.addr)}
            />
          )}
          style={styles.list}
          ListHeaderComponentStyle={styles.header}
          data={contacts}
          extraData={[navigate, onSelect, disabled]}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        />

        {onMultiSelect && selections.size > 0 && (
          <Fab icon={CheckIcon} label="Select" onPress={() => onMultiSelect(selections)} />
        )}
      </Box>
    );
  },
  ScreenSkeleton,
);

const useStyles = makeStyles(({ s }) => ({
  list: {},
  header: {
    marginHorizontal: s(16),
    marginBottom: s(8),
  },
}));
