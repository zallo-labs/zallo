import { useState } from 'react';
import { NavigateNextIcon, ScanIcon, SearchIcon } from '~/util/theme/icons';
import { Address } from 'lib';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { Searchbar } from '~/components/fields/Searchbar';
import { Screen } from '~/components/layout/Screen';
import { ListItemHeight } from '~/components/list/ListItem';
import { gql } from '@api/generated';
import { FlashList } from '@shopify/flash-list';
import { P, match } from 'ts-pattern';
import { AccountItem } from '../../components/item/AccountItem';
import { UserApproverItem } from '../../components/item/UserApproverItem';
import { ContactItem } from '../../components/item/ContactItem';
import { ADDRESS_SELECTED } from './useSelectAddress';
import { ListHeader } from '~/components/list/ListHeader';
import { useQuery } from '~/gql';
import { useScanAddress } from '~/app/scan';

const Query = gql(/* GraphQL */ `
  query AddressesModal($query: String) {
    accounts {
      __typename
      id
      address
      ...AccountItem_AccountFragment
    }

    user {
      id
      approvers {
        __typename
        id
        address
        ...UserApproverItem_UserApproverFragment
      }
    }

    contacts(input: { query: $query }) {
      __typename
      id
      address
      ...ContactItem_ContactFragment
    }
  }
`);

export interface AddressesModalParams {
  disabled?: (Address | 'accounts' | 'approvers')[];
}

export type AddressesModalProps = StackNavigatorScreenProps<'AddressesModal'>;

export const AddressesModal = withSuspense(({ route }: AddressesModalProps) => {
  const disabled = route.params.disabled && new Set(route.params.disabled);
  const scanAddress = useScanAddress();

  const [query, setQuery] = useState('');

  const { accounts, user, contacts } = useQuery(Query, { query }).data;

  return (
    <Screen>
      <Searchbar
        leading={AppbarBack2}
        placeholder="Search"
        trailing={[
          SearchIcon,
          (props) => (
            <ScanIcon {...props} onPress={async () => ADDRESS_SELECTED.next(await scanAddress())} />
          ),
        ]}
        inset={false}
        value={query}
        onChangeText={setQuery}
      />

      <FlashList
        data={[
          ...(!disabled?.has('accounts') ? [accounts.length && 'Accounts', ...accounts] : []),
          ...(!disabled?.has('approvers') ? ['User', ...user.approvers] : []),
          contacts.length && 'Contacts',
          ...contacts,
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
            .otherwise(() => null)
        }
        extraData={[disabled]}
        getItemType={(item) => (typeof item === 'object' ? item.__typename : 'header')}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
      />
    </Screen>
  );
}, ScreenSkeleton);
