import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { Box } from '~/components/layout/Box';
import { CheckIcon, PlusIcon } from '~/util/theme/icons';
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
import { useState } from 'react';
import { Appbar } from 'react-native-paper';
import produce from 'immer';

export interface ContactsScreenParams {
  title?: string;
  disabled?: Address[];
  onSelect?: (contact: Contact) => void;
  selectedSet?: Set<Address>;
  onMultiSelect?: (contacts: Set<Address>) => void;
}

export type ContactsScreenProps = RootNavigatorScreenProps<'Contacts'>;

export const ContactsScreen = ({ route, navigation }: ContactsScreenProps) => {
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
      <AppbarHeader>
        <AppbarBack />
        <AppbarSearch
          title={title || 'Contacts'}
          actions={<Appbar.Action icon={PlusIcon} onPress={create} />}
          {...searchProps}
        />
      </AppbarHeader>

      <FlatList
        renderItem={({ item }) => (
          <AddrCard
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
            disabled={disabled?.includes(item.addr)}
            selected={selections.has(item.addr)}
          />
        )}
        ItemSeparatorComponent={() => <Box mt={1} />}
        keyExtractor={(item) => item.addr}
        style={styles.list}
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
  list: {
    marginHorizontal: space(2),
  },
}));
