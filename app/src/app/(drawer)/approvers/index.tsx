import { ScrollView, StyleSheet, View } from 'react-native';
import { Actions } from '~/components/layout/Actions';
import { Text } from 'react-native-paper';
import { ListHeader } from '~/components/list/ListHeader';
import { UserApproverItem } from '~/components/item/UserApproverItem';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { LinkGoogleButton } from '~/components/link/LinkGoogleButton';
import { LinkLedgerButton } from '~/components/link/ledger/LinkLedgerButton';
import { LinkingButton } from '~/components/link/LinkingButton';
import { LinkAppleButton } from '~/components/link/LinkAppleButton';
import { showSuccess } from '~/components/provider/SnackbarProvider';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { ScreenSurface } from '~/components/layout/ScreenSurface';

const Query = gql(/* GraphQL */ `
  query MyApproversScreen {
    user {
      id
      approvers {
        id
        ...UserApproverItem_UserApprover
      }
    }
  }
`);

function MyApproversScreen() {
  const { user } = useQuery(Query).data;

  return (
    <>
      <AppbarOptions mode="large" leading={AppbarMenu} headline="My Approvers" />

      <ScreenSurface>
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

            <View style={styles.methodsContainer}>
              <LinkAppleButton />

              <LinkGoogleButton signOut onLink={() => showSuccess('Linked Google account')} />

              <LinkLedgerButton />

              <LinkingButton />
            </View>
          </Actions>
        </ScrollView>
      </ScreenSurface>
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
