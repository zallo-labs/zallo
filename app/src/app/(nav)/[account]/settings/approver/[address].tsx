import { useLocalParams } from '~/hooks/useLocalParams';
import { AccountParams } from '~/app/(nav)/[account]/_layout';
import { zAddress } from '~/lib/zod';
import { Appbar } from '#/Appbar/Appbar';
import { Pane } from '#/layout/Pane';
import { SIDE_SHEET, SideSheetLayout } from '#/SideSheet/SideSheetLayout';
import { View } from 'react-native';
import { createStyles } from '@theme/styles';
import { gql } from '@api';
import { useQuery } from '~/gql';
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
import { NotFound } from '#/NotFound';
import { asChain, asUAddress } from 'lib';
import { Scrollable } from '#/Scrollable';

const Query = gql(/* GraphQL */ `
  query ApproverSettings($account: UAddress!, $approver: Address!, $approverUAddress: UAddress!) {
    account(input: { account: $account }) {
      id
      ...ApproverPolicies_Account
    }

    approver(input: { address: $approver }) {
      id
      ...ApproverDetailsSideSheet_UserApprover
    }

    user {
      id
      approvers {
        id
      }
    }

    label(input: { address: $approverUAddress })
  }
`);

const ApproverSettingsParams = AccountParams.extend({
  address: zAddress(),
});

export default function ApproverSettingsScreen() {
  const params = useLocalParams(ApproverSettingsParams);
  const { address } = params;
  const showSheet = useSetAtom(SIDE_SHEET);

  const { account, approver, user, label } = useQuery(Query, {
    account: params.account,
    approver: address,
    approverUAddress: asUAddress(address, asChain(params.account)),
  }).data;

  const isUserApprover = user.approvers.some((a) => a.id === approver.id);

  if (!account) return <NotFound name="Account" />;

  return (
    <Pane flex>
      <Appbar mode="small" />

      <SideSheetLayout defaultVisible={isUserApprover}>
        <Scrollable contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <AddressIcon address={address} size={ICON_SIZE.extraLarge} />
            <Text variant="headlineLarge" numberOfLines={1}>
              {label || truncateAddr(address)}
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

        <ApproverDetailsSideSheet approver={approver} />
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
