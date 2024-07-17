import { useLocalParams } from '~/hooks/useLocalParams';
import { AccountParams } from '~/app/(nav)/[account]/_layout';
import { zAddress } from '~/lib/zod';
import { Appbar } from '#/Appbar/Appbar';
import { Pane } from '#/layout/Pane';
import { SIDE_SHEET, SideSheetLayout } from '#/SideSheet/SideSheetLayout';
import { View } from 'react-native';
import { createStyles } from '@theme/styles';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { ICON_SIZE } from '@theme/paper';
import { Text } from 'react-native-paper';
import { truncateAddr } from '~/util/format';
import { Button } from '#/Button';
import { Link } from 'expo-router';
import { QrCodeIcon, SettingsOutlineIcon } from '@theme/icons';
import { ApproverDetailsSideSheet } from '#/approver/ApproverDetailsSideSheet';
import { useSetAtom } from 'jotai';
import { ApproverPolicies } from '#/approver/ApproverPolicies';
import { Scrollable } from '#/Scrollable';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { Address_ApproverSettingsQuery } from '~/api/__generated__/Address_ApproverSettingsQuery.graphql';
import { asChain } from 'lib';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';

const Query = graphql`
  query Address_ApproverSettingsQuery($account: UAddress!, $approver: Address!) {
    account(address: $account) @required(action: THROW) {
      id
      ...ApproverPolicies_account
    }

    approver(address: $approver) {
      id
      label
      ...ApproverDetailsSideSheet_approver
    }

    user {
      id
      approvers {
        id
      }
    }
  }
`;

const ApproverSettingsParams = AccountParams.extend({
  address: zAddress(),
});

function ApproverSettingsScreen() {
  const params = useLocalParams(ApproverSettingsParams);
  const { address } = params;
  const showSheet = useSetAtom(SIDE_SHEET);

  const { account, approver, user } = useLazyLoadQuery<Address_ApproverSettingsQuery>(Query, {
    account: params.account,
    approver: address,
  });

  const isUserApprover = user.approvers.some((a) => a.id === approver.id);

  return (
    <Pane flex>
      <Appbar mode="small" />

      <SideSheetLayout defaultVisible={isUserApprover}>
        <Scrollable contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <AddressIcon address={address} size={ICON_SIZE.extraLarge} />
            <Text variant="headlineLarge" numberOfLines={1}>
              {approver.label || truncateAddr(address)}
            </Text>

            <View style={styles.actions}>
              <Link
                href={{
                  pathname: `/(modal)/approvers/[address]/qr`,
                  params: { address },
                }}
                asChild
              >
                <Button mode="contained-tonal" icon={QrCodeIcon}>
                  View QR
                </Button>
              </Link>

              {isUserApprover && (
                <Button
                  mode="contained-tonal"
                  icon={SettingsOutlineIcon}
                  onPress={() => showSheet((s) => !s)}
                >
                  Details
                </Button>
              )}
            </View>
          </View>

          <ApproverPolicies approver={address} account={account} />
        </Scrollable>

        <ApproverDetailsSideSheet approver={approver} chain={asChain(params.account)} />
      </SideSheetLayout>
    </Pane>
  );
}

const styles = createStyles({
  container: {
    gap: 8,
  },
  header: {
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default withSuspense(ApproverSettingsScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';