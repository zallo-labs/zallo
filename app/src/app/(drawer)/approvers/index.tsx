import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { UserApproverItem } from '~/components/item/UserApproverItem';
import { Actions } from '~/components/layout/Actions';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { LinkLedgerButton } from '~/components/link/ledger/LinkLedgerButton';
import { LinkAppleButton } from '~/components/link/LinkAppleButton';
import { LinkGoogleButton } from '~/components/link/LinkGoogleButton';
import { LinkingButton } from '~/components/link/LinkingButton';
import { ListHeader } from '~/components/list/ListHeader';
import { showSuccess } from '~/components/provider/SnackbarProvider';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { gql } from '~/gql/api/generated';

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
              <LinkAppleButton user={user} onLink={() => showSuccess('Linked Apple account')} />

              <LinkGoogleButton
                user={user}
                signOut
                onLink={() => showSuccess('Linked Google account')}
              />

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
