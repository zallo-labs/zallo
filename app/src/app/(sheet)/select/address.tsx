import { PressableOpacity } from '#/PressableOpacity';
import { AccountItem } from '#/item/AccountItem';
import { ContactItem } from '#/item/ContactItem';
import { UserApproverItem } from '#/item/UserApproverItem';
import { ListHeader } from '#/list/ListHeader';
import { ListItemHeight } from '#/list/ListItem';
import { Sheet } from '#/sheet/Sheet';
import { withSuspense } from '#/skeleton/withSuspense';
import { FlashList } from '@shopify/flash-list';
import { NavigateNextIcon, PasteIcon, ScanIcon } from '@theme/icons';
import { CORNER } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import { asAddress, asChain, isUAddress } from 'lib';
import { View } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { P, match } from 'ts-pattern';
import { z } from 'zod';
import { useScanAddress } from '~/app/scan';
import { useLocalParams } from '~/hooks/useLocalParams';
import { ADDRESS_SELECTED } from '~/hooks/useSelectAddress';
import { zChain, zArray, zUAddress, zAddress } from '~/lib/zod';
import * as Clipboard from 'expo-clipboard';
import { isAddress } from 'viem';
import { showWarning } from '#/provider/SnackbarProvider';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { graphql } from 'relay-runtime';
import { useLazyQuery } from '~/api';
import { address_SelectAddressSheetQuery } from '~/api/__generated__/address_SelectAddressSheetQuery.graphql';

const Query = graphql`
  query address_SelectAddressSheetQuery(
    $accounts: Boolean!
    $approvers: Boolean!
    $contacts: Boolean!
  ) {
    # { chain: $chain } ideally, but use {} for cache update simplicity
    accounts @include(if: $accounts) {
      __typename
      id
      address
      ...AccountItem_account
    }

    user @include(if: $approvers) {
      id
      approvers {
        __typename
        id
        address
        ...UserApproverItem_approver
      }
    }

    # { chain: $chain } ideally, but use query: null for cache update simplicity
    contacts(input: { query: null }) @include(if: $contacts) {
      __typename
      id
      address
      ...ContactItem_contact
    }
  }
`;

export const SelectAddressSheetParams = z.object({
  headline: z.string(),
  chain: zChain().optional(),
  include: zArray(z.enum(['accounts', 'approvers', 'contacts'])).default([
    'accounts',
    'approvers',
    'contacts',
  ]),
  disabled: zArray(z.union([zUAddress(), zAddress({ strict: true })])).optional(),
});
export type SelectAddressSheetParams = z.infer<typeof SelectAddressSheetParams>;

function SelectAddressSheet() {
  const { chain, include, ...params } = useLocalParams(SelectAddressSheetParams);
  const { styles } = useStyles(stylesheet);
  const disabled = params.disabled && new Set(params.disabled.flatMap((a) => [a, asAddress(a)]));
  const scanAddress = useScanAddress();

  const query = useLazyQuery<address_SelectAddressSheetQuery>(Query, {
    accounts: include.includes('accounts'),
    approvers: include.includes('approvers'),
    contacts: include.includes('contacts'),
  });

  const accounts =
    query.accounts?.filter(
      (a) => !disabled?.has(a.address) && (!chain || asChain(a.address) === chain),
    ) ?? [];
  const approvers = query.user?.approvers?.filter((a) => !disabled?.has(a.address)) ?? [];
  const contacts =
    query.contacts?.filter(
      (c) => !disabled?.has(c.address) && (!chain || asChain(c.address) === chain),
    ) ?? [];

  const scan = async () => {
    const address = await scanAddress();
    if (address) ADDRESS_SELECTED.next(address);
  };

  const paste = async () => {
    const data = await Clipboard.getStringAsync();
    if (isUAddress(data) || isAddress(data)) {
      ADDRESS_SELECTED.next(data);
    } else {
      showWarning('Copied data is not an address');
    }
  };

  const items = [
    accounts.length && 'Accounts',
    ...accounts,
    approvers.length && 'Approvers',
    ...approvers,
    contacts.length && 'Contacts',
    ...contacts,
  ].filter(Boolean);

  return (
    <Sheet contentContainer={false}>
      <FlashList
        ListHeaderComponent={
          <>
            <Text variant="headlineSmall" style={styles.headline}>
              {params.headline}
            </Text>

            <View style={styles.actions}>
              <PressableOpacity style={styles.action} onPress={scan}>
                <ScanIcon />
                <Text variant="labelLarge">Scan</Text>
              </PressableOpacity>

              <PressableOpacity style={styles.action} onPress={paste}>
                <PasteIcon />
                <Text variant="labelLarge">Paste</Text>
              </PressableOpacity>
            </View>

            <Divider horizontalInset style={styles.divider} />
          </>
        }
        renderItem={({ item }) =>
          match(item)
            .with(P.string, (v) => <ListHeader>{v}</ListHeader>)
            .with({ __typename: 'Account' }, (item) => (
              <AccountItem
                account={item}
                trailing={NavigateNextIcon}
                onPress={() => ADDRESS_SELECTED.next(item.address)}
              />
            ))
            .with({ __typename: 'Approver' }, (item) => (
              <UserApproverItem
                approver={item}
                trailing={NavigateNextIcon}
                onPress={() => ADDRESS_SELECTED.next(item.address)}
              />
            ))
            .with({ __typename: 'Contact' }, (item) => (
              <ContactItem
                contact={item}
                trailing={NavigateNextIcon}
                onPress={() => ADDRESS_SELECTED.next(item.address)}
              />
            ))
            .exhaustive()
        }
        data={items}
        /// @ts-expect-error "children is optional in props"
        renderScrollComponent={BottomSheetScrollView}
        keyExtractor={(v) => (typeof v === 'object' ? v.id : v)}
        getItemType={(item) => (typeof item === 'object' ? item.__typename : 'header')}
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        contentContainerStyle={styles.container}
      />
    </Sheet>
  );
}

const stylesheet = createStyles((_, { insets }) => ({
  container: {
    paddingBottom: insets.bottom + 8,
  },
  headline: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  action: {
    alignItems: 'center',
    gap: 8,
    width: 80,
    paddingVertical: 8,
    borderRadius: CORNER.m,
  },
  divider: {
    marginVertical: 8,
  },
}));

export default withSuspense(SelectAddressSheet, null);

export { ErrorBoundary } from '#/ErrorBoundary';
