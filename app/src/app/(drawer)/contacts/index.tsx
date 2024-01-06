import { useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { Text } from 'react-native-paper';
import { z } from 'zod';

import { useScanAddress } from '~/app/scan';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { Searchbar } from '~/components/Appbar/Searchbar';
import { Fab } from '~/components/Fab';
import { ContactItem } from '~/components/item/ContactItem';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItemHeight } from '~/components/list/ListItem';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { gql } from '~/gql/api/generated';
import { useLocalParams } from '~/hooks/useLocalParams';
import { zArray, zUAddress } from '~/lib/zod';
import { materialCommunityIcon, NavigateNextIcon, ScanIcon, SearchIcon } from '~/util/theme/icons';
import { createStyles, useStyles } from '~/util/theme/styles';

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

const ContractsScreenParams = z.object({
  disabled: zArray(zUAddress()).optional(),
});

function ContactsScreen() {
  const params = useLocalParams(ContractsScreenParams);
  const { styles } = useStyles(stylesheet);
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

const stylesheet = createStyles(({ colors }) => ({
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
