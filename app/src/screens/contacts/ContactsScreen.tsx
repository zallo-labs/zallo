import { useState } from 'react';
import { NavigateNextIcon, ScanIcon, SearchIcon } from '~/util/theme/icons';
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
import { ListHeaderButton } from '~/components/list/ListHeaderButton';
import { gql } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import { ContactsScreenQuery, ContactsScreenQueryVariables } from '@api/gen/graphql';
import { FlashList } from '@shopify/flash-list';
import { ContactItem } from './ContactItem';

const QueryDoc = gql(/* GraphQL */ `
  query ContactsScreen($query: String) {
    contacts(input: { query: $query }) {
      id
      address
      ...ContactItem_ContactFragment
    }
  }
`);

export interface ContactsScreenParams {
  disabled?: Address[];
}

export type ContactsScreenProps = StackNavigatorScreenProps<'Contacts'>;

export const ContactsScreen = withSuspense(
  ({ route, navigation: { navigate } }: ContactsScreenProps) => {
    const disabled = route.params.disabled && new Set(route.params.disabled);
    const scanAddress = useScanAddress();

    const [query, setQuery] = useState('');

    const { contacts } = useSuspenseQuery<ContactsScreenQuery, ContactsScreenQueryVariables>(
      QueryDoc,
      { variables: { query } },
    ).data;

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
          inset
          value={query}
          onChangeText={setQuery}
        />

        <FlashList
          data={contacts}
          ListHeaderComponent={
            <ListHeader
              trailing={
                <ListHeaderButton onPress={() => navigate('Contact', {})}>Add</ListHeaderButton>
              }
            >
              Contacts
            </ListHeader>
          }
          renderItem={({ item }) => (
            <ContactItem
              contact={item}
              trailing={NavigateNextIcon}
              disabled={disabled?.has(item.address)}
              onPress={() => navigate('Contact', { address: item.address })}
            />
          )}
          extraData={[disabled, navigate]}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        />
      </Screen>
    );
  },
  ScreenSkeleton,
);
