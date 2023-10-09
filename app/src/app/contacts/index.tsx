import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { NavigateNextIcon, ScanIcon, SearchIcon, materialCommunityIcon } from '~/util/theme/icons';
import { Address } from 'lib';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { Searchbar } from '~/components/fields/Searchbar';
import { ListHeader } from '~/components/list/ListHeader';
import { Screen } from '~/components/layout/Screen';
import { ListItemHeight } from '~/components/list/ListItem';
import { gql } from '@api/generated';
import { FlashList } from '@shopify/flash-list';
import { Text } from 'react-native-paper';
import { Fab } from '~/components/Fab';
import { makeStyles } from '@theme/makeStyles';
import { useQuery } from '~/gql';
import { useScanAddress } from '~/app/scan';
import { ContactItem } from '~/components/item/ContactItem';

const Query = gql(/* GraphQL */ `
  query ContactsScreen($query: String) {
    contacts(input: { query: $query }) {
      id
      address
      ...ContactItem_ContactFragment
    }
  }
`);

const AddContactIcon = materialCommunityIcon('account-plus-outline');

export type ContactsScreenRoute = `/contacts/`;
export type ContactsScreenParams = {
  disabled?: Address[];
};

export default function ContactsScreen() {
  const params = useLocalSearchParams<ContactsScreenParams>();
  const styles = useStyles();
  const disabled = params.disabled && new Set(params.disabled);
  const router = useRouter();
  const scanAddress = useScanAddress();

  const [query, setQuery] = useState('');

  const { contacts } = useQuery(Query, { query }).data;

  return (
    <Screen>
      <Searchbar
        leading={AppbarBack2}
        placeholder="Search contacts"
        trailing={[
          SearchIcon,
          (props) => (
            <ScanIcon
              {...props}
              onPress={async () =>
                router.push({
                  pathname: `/contacts/[address]`,
                  params: { address: await scanAddress() },
                })
              }
            />
          ),
        ]}
        value={query}
        onChangeText={setQuery}
      />

      <FlashList
        data={contacts}
        ListHeaderComponent={<ListHeader>Contacts</ListHeader>}
        renderItem={({ item }) => (
          <ContactItem
            contact={item}
            trailing={NavigateNextIcon}
            disabled={disabled?.has(item.address)}
            onPress={() =>
              router.push({ pathname: `/contacts/[address]`, params: { address: item.address } })
            }
          />
        )}
        ListEmptyComponent={
          <Text variant="bodyLarge" style={styles.emptyText}>
            Add a contact to get started
          </Text>
        }
        extraData={[disabled, router.push]}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
      />

      <Fab icon={AddContactIcon} label="Add" onPress={async () => router.push(`/contacts/add`)} />
    </Screen>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  emptyText: {
    marginHorizontal: 16,
    marginVertical: 8,
    color: colors.onSurfaceVariant,
  },
}));
