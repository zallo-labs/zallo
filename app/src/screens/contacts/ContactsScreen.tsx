import { Box } from '~/components/layout/Box';
import { CheckIcon, PlusIcon, SearchIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { Address } from 'lib';
import { FlatList } from 'react-native';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { FAB } from '~/components/FAB';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { Contact, useContacts } from '~/queries/contacts/useContacts.api';
import { useFuzzySearch } from '@hook/useFuzzySearch';
import { useState } from 'react';
import { Appbar, TextInput } from 'react-native-paper';
import produce from 'immer';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { TextField } from '~/components/fields/TextField';
import { AddrItem } from '~/components/addr/AddrItem';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';

export interface ContactsScreenParams {
  title?: string;
  disabled?: Address[];
  onSelect?: (contact: Contact) => void;
  selectedSet?: Set<Address>;
  onMultiSelect?: (contacts: Set<Address>) => void;
}

export type ContactsScreenProps = RootNavigatorScreenProps<'Contacts'>;

const ContactsScreen = ({ route, navigation }: ContactsScreenProps) => {
  const { title, disabled, onSelect, onMultiSelect } = route.params;
  const styles = useStyles();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const [allContacts] = useContacts();

  const [contacts, searchProps] = useFuzzySearch(allContacts, ['name', 'addr']);

  const [selections, setSelections] = useState<Set<Address>>(
    () => route.params.selectedSet ?? new Set(),
  );

  const create = () => navigation.navigate('Contact', {});

  return (
    <Box flex={1}>
      <AppbarHeader mode="medium">
        <Appbar.BackAction onPress={useGoBack()} />
        <Appbar.Content title={title || 'Contacts'} />
        <Appbar.Action icon={PlusIcon} onPress={create} />
      </AppbarHeader>

      <FlatList
        ListHeaderComponent={
          <TextField
            left={<TextInput.Icon icon={SearchIcon} />}
            label="Search"
            {...searchProps}
          />
        }
        renderItem={({ item }) => (
          <AddrItem
            addr={item.addr}
            onPress={() => {
              if (onSelect) {
                onSelect(item);
              } else if (onMultiSelect) {
                setSelections(
                  produce((selections) => {
                    if (!selections.delete(item.addr))
                      selections.add(item.addr);
                  }),
                );
              } else {
                navigation.navigate('Contact', { addr: item.addr });
              }
            }}
            selected={selections.has(item.addr)}
            disabled={disabled?.includes(item.addr)}
          />
        )}
        style={styles.list}
        ListHeaderComponentStyle={styles.header}
        data={contacts}
        extraData={[navigation, onSelect, disabled]}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
      />

      {onMultiSelect && selections.size > 0 && (
        <FAB
          icon={CheckIcon}
          label="Select"
          onPress={() => onMultiSelect(selections)}
        />
      )}
    </Box>
  );
};

const useStyles = makeStyles(({ space }) => ({
  list: {},
  header: {
    marginHorizontal: space(2),
    marginBottom: space(1),
  },
}));

export default withSkeleton(ContactsScreen, ScreenSkeleton);
