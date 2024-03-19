import { useState } from 'react';
import { Platform } from 'react-native';
import { NavigateNextIcon, ScanIcon, SearchIcon } from '~/util/theme/icons';
import { AppbarBack } from '#/Appbar/AppbarBack';
import { ListItemHeight } from '#/list/ListItem';
import { gql } from '@api/generated';
import { FlashList } from '@shopify/flash-list';
import { P, match } from 'ts-pattern';
import { AccountItem } from '#/item/AccountItem';
import { UserApproverItem } from '#/item/UserApproverItem';
import { ContactItem } from '#/item/ContactItem';
import { ListHeader } from '#/list/ListHeader';
import { useQuery } from '~/gql';
import { useScanAddress } from '~/app/scan';
import { ADDRESS_SELECTED } from '~/hooks/useSelectAddress';
import { TokenItem } from '#/token/TokenItem';
import { z } from 'zod';
import { zAddress, zArray, zChain, zUAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { asAddress } from 'lib';
import { ScreenSurface } from '#/layout/ScreenSurface';
import { SearchbarOptions } from '#/Appbar/SearchbarOptions';

const Query = gql(/* GraphQL */ `
  query AddressesScreen(
    $query: String
    $chain: Chain
    $includeAccounts: Boolean!
    $includeApprovers: Boolean!
    $includeContacts: Boolean!
    $includeTokens: Boolean!
  ) {
    accounts(input: { chain: $chain }) @include(if: $includeAccounts) {
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

    contacts(input: { query: $query, chain: $chain }) @include(if: $includeContacts) {
      __typename
      id
      address
      ...ContactItem_Contact
    }

    tokens(input: { query: $query, chain: $chain }) @include(if: $includeTokens) {
      __typename
      id
      address
      ...TokenItem_Token
    }
  }
`);

const AddressesScreenParams = z.object({
  chain: zChain().optional(),
  include: zArray(z.enum(['accounts', 'approvers', 'contacts', 'tokens'])).optional(),
  disabled: zArray(z.union([zUAddress(), zAddress({ strict: true })])).optional(),
});
export type AddressesModalParams = z.infer<typeof AddressesScreenParams>;

function AddressesScreen() {
  const { chain, include, ...params } = useLocalParams(AddressesScreenParams);
  const disabled = params.disabled && new Set(params.disabled.flatMap((a) => [a, asAddress(a)]));
  const scanAddress = useScanAddress();

  const [query, setQuery] = useState('');

  const { accounts, user, contacts, tokens } = useQuery(Query, {
    query,
    chain,
    includeAccounts: !include || include.includes('accounts'),
    includeApprovers: !include || include.includes('approvers'),
    includeContacts: !include || include.includes('contacts'),
    includeTokens: !include || include.includes('tokens'),
  }).data;

  return (
    <>
      <SearchbarOptions
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
        inset={Platform.OS === 'android'}
        value={query}
        onChangeText={setQuery}
      />

      <ScreenSurface>
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
      </ScreenSurface>
    </>
  );
}

export default withSuspense(AddressesScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';