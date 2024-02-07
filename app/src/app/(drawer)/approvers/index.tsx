import { ScrollView, StyleSheet, View } from 'react-native';
import { Actions } from '~/components/layout/Actions';
import { Text } from 'react-native-paper';
import { ListHeader } from '~/components/list/ListHeader';
import { UserApproverItem } from '~/components/item/UserApproverItem';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { LinkGoogleButton } from '~/components/link/google/LinkGoogleButton';
import { LinkLedgerButton } from '~/components/link/ledger/LinkLedgerButton';
import { LinkZalloButton } from '~/components/link/LinkZallo';
import { LinkAppleButton } from '~/components/link/LinkAppleButton';
import { showSuccess } from '~/components/provider/SnackbarProvider';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { ScrollableScreenSurface } from '~/components/layout/ScrollableScreenSurface';

const Query = gql(/* GraphQL */ `
  query MyApproversScreen {
    user {
      id
      approvers {
        id
        ...UserApproverItem_UserApprover
      }
      ...LinkAppleButton_User
      ...LinkGoogleButton_User
    }
  }
`);

function MyApproversScreen() {
  const { user } = useQuery(Query).data;

  return (
    <>
      <AppbarOptions mode="large" leading={AppbarMenu} headline="My Approvers" />

      <ScrollableScreenSurface>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text variant="bodyMedium" style={styles.description}>
            This device can access accounts from any of your approvers, but may not approve on their
            behalf
          </Text>

          <ListHeader>Approvers</ListHeader>

          {user.approvers.map((approver) => (
            <UserApproverItem key={approver.id} approver={approver} />
          ))}

          <Actions>
            <Text variant="titleMedium" style={styles.linkText}>
              Link
            </Text>

            <LinkZalloButton />
            <LinkLedgerButton />
            <LinkAppleButton user={user} onLink={() => showSuccess('Linked Apple account')} />
            <LinkGoogleButton
              user={user}
              signOut
              onLink={() => showSuccess('Linked Google account')}
            />
          </Actions>
        </ScrollView>
      </ScrollableScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  description: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  linkText: {
    textAlign: 'center',
  },
  methodsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
});

export default withSuspense(MyApproversScreen, <ScreenSkeleton />);
