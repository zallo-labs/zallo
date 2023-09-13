import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar } from '~/components/Appbar/Appbar';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { Screen } from '~/components/layout/Screen';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { FormResetIcon } from '~/components/fields/ResetFormIcon';
import { Text } from 'react-native-paper';
import { ListHeader } from '~/components/list/ListHeader';
import { UserApproverItem } from './UserApproverItem';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { useMutation } from 'urql';
import { LinkGoogleButton } from '~/components/buttons/LinkGoogleButton';
import { LinkLedgerButton } from '~/components/buttons/LinkLedgerButton';
import { LinkingCodeButton } from '~/components/buttons/LinkingCodeButton';
import { showSuccess } from '~/provider/SnackbarProvider';
import { LinkAppleButton } from '~/components/buttons/LinkAppleButton';

const Query = gql(/* GraphQL */ `
  query UserScreen {
    user {
      id
      name

      approvers {
        id
        ...UserApproverItem_UserApproverFragment
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

export type UserScreenProps = StackNavigatorScreenProps<'User'>;

export const UserScreen = ({ navigation: { navigate } }: UserScreenProps) => {
  const { user } = useQuery(Query).data;
  const update = useMutation(Update)[1];

  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { name: user.name ?? '' },
  });

  return (
    <Screen bottomInset={false}>
      <Appbar
        mode="large"
        leading="back"
        headline="User"
        trailing={(props) => <FormResetIcon control={control} reset={reset} {...props} />}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <FormTextField
          label="Name"
          supporting="Only visible by account members"
          name="name"
          placeholder="Alisha"
          control={control}
          rules={{ required: true }}
          containerStyle={styles.nameContainer}
          onEndEditing={handleSubmit(async ({ name }) => {
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

            <LinkingCodeButton />
          </View>
        </Actions>
      </ScrollView>
    </Screen>
  );
};

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
