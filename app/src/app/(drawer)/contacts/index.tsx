import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { NavigateNextIcon, ScanIcon, SearchIcon, materialCommunityIcon } from '~/util/theme/icons';
import { Address } from 'lib';
import { Searchbar } from '~/components/Appbar/Searchbar';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItemHeight } from '~/components/list/ListItem';
import { gql } from '@api/generated';
import { FlashList } from '@shopify/flash-list';
import { Text, Surface } from 'react-native-paper';
import { Fab } from '~/components/Fab';
import { makeStyles } from '@theme/makeStyles';
import { useQuery } from '~/gql';
import { useScanAddress } from '~/app/scan';
import { ContactItem } from '~/components/item/ContactItem';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { ScreenSurface } from '~/components/layout/ScreenSurface';

const Query = gql(/* GraphQL */ `
  query ContactsScreen($query: String) {
    contacts(input: { query: $query }) {
      id
      address
      ...ContactItem_Contact
    }
  }
`);

const AddContactIcon = materialCommunityIcon('account-plus-outline');

export type ContactsScreenRoute = `/contacts/`;
export type ContactsScreenParams = {
  disabled?: Address[];
};

function ContactsScreen() {
  const params = useLocalSearchParams<ContactsScreenParams>();
  const styles = useStyles();
  const disabled = params.disabled && new Set(params.disabled);
  const router = useRouter();
  const scanAddress = useScanAddress();

  const [query, setQuery] = useState('');

  const { contacts } = useQuery(Query, { query }).data;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Searchbar
        leading={(props) => <AppbarMenu fallback={SearchIcon} {...props} />}
        placeholder="Search contacts"
        trailing={(props) => (
          <ScanIcon
            {...props}
            onPress={async () => {
              const address = await scanAddress();
              if (address) {
                router.push({
                  pathname: `/(drawer)/contacts/[address]`,
                  params: { address },
                });
              }
            }}
          />
        )}
        value={query}
        onChangeText={setQuery}
      />

      <ScreenSurface>
        <FlashList
          data={contacts}
          ListHeaderComponent={<ListHeader>Contacts</ListHeader>}
          renderItem={({ item }) => (
            <ContactItem
              contact={item}
              trailing={NavigateNextIcon}
              disabled={disabled?.has(item.address)}
              onPress={() =>
                router.push({
                  pathname: `/(drawer)/contacts/[address]`,
                  params: { address: item.address },
                })
              }
            />
          )}
          ListEmptyComponent={
            <Text variant="bodyLarge" style={styles.emptyText}>
              Add a contact to get started
            </Text>
          }
          extraData={[disabled, router.push]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        />

        <Fab icon={AddContactIcon} label="Add" onPress={async () => router.push(`/contacts/add`)} />
      </ScreenSurface>
    </>
  );
}

const useStyles = makeStyles(({ colors, corner }) => ({
  contentContainer: {
    paddingVertical: 8,
  },
  emptyText: {
    marginHorizontal: 16,
    marginVertical: 8,
    color: colors.onSurfaceVariant,
  },
}));

export default withSuspense(ContactsScreen, ScreenSkeleton);
