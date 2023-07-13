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
import { useScanAddress } from '../scan/ScanScreen';
import { gql } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import { AddressesModalQuery, AddressesModalQueryVariables } from '@api/gen/graphql';
import { FlashList } from '@shopify/flash-list';
import { P, match } from 'ts-pattern';
import { AccountItem } from '../accounts/AccountItem';
import { UserApproverItem } from '../user/UserApproverItem';
import { ContactItem } from '../contacts/ContactItem';
import { ADDRESS_EMITTER } from './useSelectAddress';
import { ListHeader } from '~/components/list/ListHeader';

const QueryDoc = gql(/* GraphQL */ `
  query AddressesModal($query: String) {
    accounts {
      id
      address
      ...AccountItem_AccountFragment
    }

    user {
      id
      approvers {
        address
        ...UserApproverItem_UserApproverFragment
      }
    }

    contacts(input: { query: $query }) {
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

  const { accounts, user, contacts } = useSuspenseQuery<
    AddressesModalQuery,
    AddressesModalQueryVariables
  >(QueryDoc, { variables: { query } }).data;

  return (
    <Screen>
      <Searchbar
        leading={AppbarBack2}
        placeholder="Search"
        trailing={[
          SearchIcon,
          (props) => (
            <ScanIcon {...props} onPress={async () => ADDRESS_EMITTER.emit(await scanAddress())} />
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
                onPress={() => ADDRESS_EMITTER.emit(item.address)}
              />
            ))
            .with({ __typename: 'UserApprover' }, (item) => (
              <UserApproverItem
                approver={item}
                trailing={NavigateNextIcon}
                disabled={disabled?.has(item.address)}
                onPress={() => ADDRESS_EMITTER.emit(item.address)}
              />
            ))
            .with({ __typename: 'Contact' }, (item) => (
              <ContactItem
                contact={item}
                trailing={NavigateNextIcon}
                disabled={disabled?.has(item.address)}
                onPress={() => ADDRESS_EMITTER.emit(item.address)}
              />
            ))
            .otherwise(() => null)
        }
        extraData={[disabled]}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        getItemType={(item) => (typeof item === 'object' ? 'row' : 'header')}
      />
    </Screen>
  );
}, ScreenSkeleton);
