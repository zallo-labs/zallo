import { useState } from 'react';
import { NavigateNextIcon, ScanIcon, SearchIcon } from '~/util/theme/icons';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { Searchbar } from '~/components/fields/Searchbar';
import { ListItemHeight } from '~/components/list/ListItem';
import { gql } from '@api/generated';
import { FlashList } from '@shopify/flash-list';
import { P, match } from 'ts-pattern';
import { AccountItem } from '~/components/item/AccountItem';
import { UserApproverItem } from '~/components/item/UserApproverItem';
import { ContactItem } from '~/components/item/ContactItem';
import { ListHeader } from '~/components/list/ListHeader';
import { useQuery } from '~/gql';
import { useScanAddress } from '~/app/scan';
import { StyleSheet, View } from 'react-native';
import { ADDRESS_SELECTED } from '~/hooks/useSelectAddress';
import { TokenItem } from '~/components/token/TokenItem';
import { z } from 'zod';
import { zAddress, zArray } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { Stack } from 'expo-router';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';

const Query = gql(/* GraphQL */ `
  query AddressesScreen(
    $query: String
    $includeAccounts: Boolean!
    $includeApprovers: Boolean!
    $includeContacts: Boolean!
    $includeTokens: Boolean!
  ) {
    accounts @include(if: $includeAccounts) {
      __typename
      id
      address
      ...AccountItem_Account
    }

    user @include(if: $includeApprovers) {
      id
      approvers {
        __typename
        id
        address
        ...UserApproverItem_UserApprover
      }
    }

    contacts(input: { query: $query }) @include(if: $includeContacts) {
      __typename
      id
      address
      ...ContactItem_Contact
    }

    tokens @include(if: $includeTokens) {
      __typename
      id
      address
      ...TokenItem_Token
    }
  }
`);

const paramsSchema = z.object({
  include: zArray(z.enum(['accounts', 'approvers', 'contacts', 'tokens'])).optional(),
  disabled: zArray(zAddress).optional(),
});
export type AddressesModalParams = z.infer<typeof paramsSchema>;

function AddressesScreen() {
  const params = useLocalParams(`/addresses`, paramsSchema);
  const disabled = params.disabled && new Set(params.disabled);
  const scanAddress = useScanAddress();

  const [query, setQuery] = useState('');

  const { accounts, user, contacts, tokens } = useQuery(Query, {
    query,
    includeAccounts: !params.include || params.include.includes('accounts'),
    includeApprovers: !params.include || params.include.includes('approvers'),
    includeContacts: !params.include || params.include.includes('contacts'),
    includeTokens: !params.include || params.include.includes('tokens'),
  }).data;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <Searchbar
        leading={AppbarBack}
        placeholder="Search"
        trailing={[
          SearchIcon,
          (props) => (
            <ScanIcon
              {...props}
              onPress={async () => {
                const address = await scanAddress();
                if (address) ADDRESS_SELECTED.next(address);
              }}
            />
          ),
        ]}
        inset={false}
        value={query}
        onChangeText={setQuery}
      />

      <FlashList
        data={[
          accounts?.length && 'Accounts',
          ...(accounts ?? []),
          user?.approvers?.length && 'User',
          ...(user?.approvers ?? []),
          contacts?.length && 'Contacts',
          ...(contacts ?? []),
          tokens?.length && 'Tokens',
          ...(tokens ?? []),
        ]}
        renderItem={({ item }) =>
          match(item)
            .with(P.string, (section) => <ListHeader>{section}</ListHeader>)
            .with({ __typename: 'Account' }, (item) => (
              <AccountItem
                account={item}
                trailing={NavigateNextIcon}
                disabled={disabled?.has(item.address)}
                onPress={() => ADDRESS_SELECTED.next(item.address)}
              />
            ))
            .with({ __typename: 'UserApprover' }, (item) => (
              <UserApproverItem
                approver={item}
                trailing={NavigateNextIcon}
                disabled={disabled?.has(item.address)}
                onPress={() => ADDRESS_SELECTED.next(item.address)}
              />
            ))
            .with({ __typename: 'Contact' }, (item) => (
              <ContactItem
                contact={item}
                trailing={NavigateNextIcon}
                disabled={disabled?.has(item.address)}
                onPress={() => ADDRESS_SELECTED.next(item.address)}
              />
            ))
            .with({ __typename: 'Token' }, (item) => (
              <TokenItem
                token={item}
                amount={undefined}
                trailing={NavigateNextIcon}
                disabled={disabled?.has(item.address)}
                onPress={() => ADDRESS_SELECTED.next(item.address)}
              />
            ))
            .with(0, () => null)
            .with(undefined, () => null)
            .exhaustive()
        }
        extraData={[disabled]}
        getItemType={(item) => (typeof item === 'object' ? item.__typename : 'header')}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default withSuspense(AddressesScreen, <ScreenSkeleton />);
