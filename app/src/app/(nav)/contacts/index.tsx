import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { AddIcon, ContactsIcon, NavigateNextIcon, ScanIcon } from '~/util/theme/icons';
import { Searchbar } from '#/Appbar/Searchbar';
import { Fab } from '#/Fab';
import { useScanAddress } from '~/app/scan';
import { ContactItem } from '#/item/ContactItem';
import { withSuspense } from '#/skeleton/withSuspense';
import { createStyles, useStyles } from '@theme/styles';
import { PaneSkeleton } from '#/skeleton/PaneSkeleton';
import { ItemList } from '#/layout/ItemList';
import { usePath } from '#/usePath';
import { useRouteInfo } from 'expo-router/build/hooks';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { ICON_SIZE } from '@theme/paper';
import { MenuOrSearchIcon } from '#/Appbar/MenuOrSearchIcon';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { contacts_ContactsPaneQuery } from '~/api/__generated__/contacts_ContactsPaneQuery.graphql';

const Query = graphql`
  query contacts_ContactsPaneQuery($query: String) {
    contacts(input: { query: $query }) {
      id
      address
      ...ContactItem_contact
    }
  }
`;

function ContactsPane_() {
  const { styles } = useStyles(stylesheet);
  const router = useRouter();
  const contactSelected = usePath().includes('/(nav)/contacts/[address]');
  const currentRouteParams = useRouteInfo().params;
  const scanAddress = useScanAddress();

  const [query, setQuery] = useState('');

  const { contacts } = useLazyLoadQuery<contacts_ContactsPaneQuery>(Query, {
    query: query || null,
  });

  return (
    <>
      <Searchbar
        leading={MenuOrSearchIcon}
        placeholder="Search contacts"
        trailing={(props) => (
          <ScanIcon
            {...props}
            onPress={async () => {
              const address = await scanAddress();
              if (address) {
                router.push({
                  pathname: `/(nav)/contacts/[address]`,
                  params: { address },
                });
              }
            }}
          />
        )}
        value={query}
        onChangeText={setQuery}
      />

      <ItemList style={styles.list}>
        {contacts.map((c) => (
          <Link
            key={c.id}
            href={{ pathname: `/(nav)/contacts/[address]`, params: { address: c.address } }}
            asChild
          >
            <ContactItem
              contact={c}
              trailing={NavigateNextIcon}
              containerStyle={styles.item}
              selected={contactSelected && currentRouteParams.address === c.address}
            />
          </Link>
        ))}
      </ItemList>

      {!contacts.length && (
        <View style={styles.emptyContainer}>
          <ContactsIcon size={ICON_SIZE.extraLarge} style={styles.emptyIcon} />
          <Text variant="headlineSmall" style={styles.emptyText}>
            Add a contact to get started
          </Text>
        </View>
      )}

      <Fab icon={AddIcon} label="Add contact" onPress={async () => router.push(`/contacts/add`)} />
    </>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  list: {
    marginTop: 8,
  },
  item: {
    backgroundColor: colors.surface,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    color: colors.onSurfaceVariant,
  },
  emptyText: {
    color: colors.onSurface,
  },
}));

export const ContactsPane = withSuspense(ContactsPane_, <PaneSkeleton />);

export default function ContactsScreen() {
  return null;
}

export { ErrorBoundary } from '#/ErrorBoundary';
