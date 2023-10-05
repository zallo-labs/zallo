import { useState } from 'react';
import { NavigateNextIcon, ScanIcon, SearchIcon, materialCommunityIcon } from '~/util/theme/icons';
import { Address } from 'lib';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { Searchbar } from '~/components/fields/Searchbar';
import { ListHeader } from '~/components/list/ListHeader';
import { Screen } from '~/components/layout/Screen';
import { ListItemHeight } from '~/components/list/ListItem';
import { useScanAddress } from '../scan/ScanScreen';
import { gql } from '@api/generated';
import { FlashList } from '@shopify/flash-list';
import { ContactItem } from './ContactItem';
import { Text } from 'react-native-paper';
import { Fab } from '~/components/Fab';
import { makeStyles } from '@theme/makeStyles';
import { useQuery } from '~/gql';

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

export interface ContactsScreenParams {
  disabled?: Address[];
}

export type ContactsScreenProps = StackNavigatorScreenProps<'Contacts'>;

export const ContactsScreen = withSuspense(
  ({ route, navigation: { navigate } }: ContactsScreenProps) => {
    const styles = useStyles();
    const disabled = route.params.disabled && new Set(route.params.disabled);
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
                onPress={async () => navigate('Contact', { address: await scanAddress() })}
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
              onPress={() => navigate('Contact', { address: item.address })}
            />
          )}
          ListEmptyComponent={
            <Text variant="bodyLarge" style={styles.emptyText}>
              Add a contact to get started
            </Text>
          }
          extraData={[disabled, navigate]}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        />

        <Fab icon={AddContactIcon} label="Add" onPress={async () => navigate('Contact', {})} />
      </Screen>
    );
  },
  ScreenSkeleton,
);

const useStyles = makeStyles(({ colors }) => ({
  emptyText: {
    marginHorizontal: 16,
    marginVertical: 8,
    color: colors.onSurfaceVariant,
  },
}));
