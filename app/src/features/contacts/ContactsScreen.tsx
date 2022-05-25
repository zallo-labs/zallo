import { useCallback, useEffect, useMemo, useState } from 'react';
import { FAB, TextInput, Title, useTheme } from 'react-native-paper';
import { Address } from 'lib';
import { ethers } from 'ethers';
import FuzzySearch from 'fuzzy-search';
import { Box } from '@components/Box';
import { RootStackScreenProps } from '@features/navigation/RootNavigation';
import { AddrLink } from '@features/qr/addrLink';
import { Contact, useContacts } from '@gql/queries/useContacts';
import { TextField } from '@components/fields/TextField';
import { ContactItem } from './ContactItem';
import { CreateContactButton } from './CreateContactButton';
import { SelectAddressButton } from './SelectAddressButton';
import { FlatList } from 'react-native';
import { Actions } from '@components/Actions';
import { ActionsSpaceFooter } from '@components/ActionsSpaceFooter';

const CONTACT_SEARCH_FIELDS: (keyof Contact)[] = ['name', 'addr'];

export interface ContactsScreenParams {
  disabledAddrs?: Address[];
  // Callbacks
  scannedAddr?: AddrLink;
}

export type ContactsScreenProps = RootStackScreenProps<'Contacts'>;

export const ContactsScreen = ({
  navigation,
  route: { params },
}: ContactsScreenProps) => {
  const { disabledAddrs, scannedAddr } = params;
  const { contacts: allContacts } = useContacts();
  const { colors, radius } = useTheme();

  const [search, setSearch] = useState('');
  const [error, setError] = useState(false);

  const select = useCallback(
    (addr: Address) => {
      if (ethers.utils.isAddress(addr)) {
        navigation.navigate({
          name: 'GroupManagement',
          params: { selected: addr },
          merge: true,
        });
      } else {
        setError(true);
      }
    },
    [navigation, setError],
  );

  useEffect(() => {
    if (scannedAddr) select(scannedAddr.target_address);
  }, [scannedAddr, select]);

  const contacts = useMemo(() => {
    const sorted = allContacts.sort((a, b) => a.name.localeCompare(b.name));

    const searcher = new FuzzySearch(sorted, CONTACT_SEARCH_FIELDS, {
      caseSensitive: false,
    });

    return searcher.search(search);
  }, [allContacts, search]);

  return (
    <Box flex={1}>
      <FlatList
        ListHeaderComponent={
          <Box
            p={2}
            backgroundColor={colors.opaqueSurface}
            borderBottomLeftRadius={radius}
            borderBottomRightRadius={radius}
          >
            <TextField
              value={search}
              onChangeText={(value) => {
                setError(false);
                setSearch(value);
              }}
              label="Search"
              placeholder="Search by name or address"
              right={
                <TextInput.Icon
                  name="line-scan"
                  onPress={() =>
                    navigation.navigate('QrScanner', { screen: 'Contacts' })
                  }
                />
              }
              error={error && 'Not a valid address'}
            />

            <SelectAddressButton input={search} select={select} />
          </Box>
        }
        stickyHeaderIndices={[0]}
        data={contacts}
        renderItem={({ item: contact }) => (
          <ContactItem
            contact={contact}
            select={select}
            disabled={disabledAddrs?.includes(contact.addr)}
            p={2}
          />
        )}
        keyExtractor={(contact) => contact.addr}
        ListFooterComponent={<ActionsSpaceFooter />}
      />

      <Actions>
        <CreateContactButton input={search} />
      </Actions>
    </Box>
  );
};
