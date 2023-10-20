import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { FormResetIcon } from '~/components/fields/ResetFormIcon';
import { Text } from 'react-native-paper';
import { ListHeader } from '~/components/list/ListHeader';
import { UserApproverItem } from '~/components/item/UserApproverItem';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { useMutation } from 'urql';
import { LinkGoogleButton } from '~/components/link/LinkGoogleButton';
import { LinkLedgerButton } from '~/components/link/ledger/LinkLedgerButton';
import { LinkingButton } from '~/components/link/LinkingButton';
import { LinkAppleButton } from '~/components/link/LinkAppleButton';
import { showSuccess } from '~/components/provider/SnackbarProvider';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';

const Query = gql(/* GraphQL */ `
  query UserScreen {
    user {
      id
      name

      approvers {
        id
        ...UserApproverItem_UserApprover
      }
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation UserScreen_Update($name: String!) {
    updateUser(input: { name: $name }) {
      id
      name
    }
  }
`);

interface Inputs {
  name: string;
}

function UserScreen() {
  const update = useMutation(Update)[1];
  const { user } = useQuery(Query).data;

  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { name: user.name ?? '' },
  });

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <AppbarOptions
        mode="large"
        leading={AppbarMenu}
        headline="User"
        trailing={(props) => <FormResetIcon control={control} reset={reset} {...props} />}
      />

      <FormTextField
        label="Name"
        supporting="Only visible by account members"
        name="name"
        placeholder="Alisha"
        control={control}
        rules={{ required: true }}
        containerStyle={styles.nameContainer}
        onBlur={handleSubmit(async ({ name }) => {
          await update({ name });
        })}
      />

      <View>
        <ListHeader>Approvers</ListHeader>

        {user.approvers.map((approver) => (
          <UserApproverItem key={approver.id} approver={approver} />
        ))}
      </View>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  nameContainer: {
    margin: 16,
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
  actionButton: {
    alignSelf: 'stretch',
  },
});

export default withSuspense(UserScreen, <ScreenSkeleton />);
