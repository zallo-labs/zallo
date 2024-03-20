import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { NavigateNextIcon, ScanIcon, SearchIcon, materialCommunityIcon } from '~/util/theme/icons';
import { Searchbar } from '#/Appbar/Searchbar';
import { ListHeader } from '#/list/ListHeader';
import { ListItemHeight } from '#/list/ListItem';
import { gql } from '@api/generated';
import { FlashList } from '@shopify/flash-list';
import { Text } from 'react-native-paper';
import { Fab } from '#/Fab';
import { useQuery } from '~/gql';
import { useScanAddress } from '~/app/scan';
import { ContactItem } from '#/item/ContactItem';
import { AppbarMenu } from '#/Appbar/AppbarMenu';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { createStyles, useStyles } from '@theme/styles';
import { z } from 'zod';
import { zArray, zUAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { ScreenSurface } from '#/layout/ScreenSurface';

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
            <Text variant="titleLarge" style={styles.emptyText}>
              Add a friend or trusted address to get started
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

const stylesheet = createStyles({
  contentContainer: {
    paddingVertical: 8,
  },
  emptyText: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
});

export default withSuspense(ContactsScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
