import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { Appbar } from '~/components/Appbar/Appbar';
import { FormSubmitButton, useFormSubmitDisabled } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { Screen } from '~/components/layout/Screen';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { FormResetIcon } from '~/components/fields/ResetFormIcon';
import { gql, useSuspenseQuery } from '@apollo/client';
import { UserDocument, UserQuery, UserQueryVariables, useUserUpdateMutation } from '@api/generated';

gql`
  query User {
    user {
      id
      name
    }
  }

  mutation UserUpdate($name: String!) {
    updateUser(input: { name: $name }) {
      id
      name
    }
  }
`;

interface Inputs {
  name: string;
}

export type UserScreenProps = StackNavigatorScreenProps<'User' | 'CreateUser'>;

export const UserScreen = ({ route, navigation: { navigate } }: UserScreenProps) => {
  const isOnboarding = route.name === 'CreateUser';
  const [update] = useUserUpdateMutation();
  const { user } = useSuspenseQuery<UserQuery, UserQueryVariables>(UserDocument).data;

  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { name: user.name ?? '' },
  });

  return (
    <Screen>
      <Appbar
        mode="large"
        leading="back"
        headline="User"
        trailing={(props) => <FormResetIcon control={control} reset={reset} {...props} />}
      />

      <FormTextField
        label="Name"
        supporting="Only visible by account members"
        name="name"
        placeholder="Alisha"
        autoFocus
        control={control}
        rules={{ required: true }}
        containerStyle={styles.nameContainer}
        onEndEditing={handleSubmit(async ({ name }) => {
          await update({ variables: { name } });
        })}
      />

      <Actions>
        {isOnboarding && (
          <FormSubmitButton
            mode="contained"
            control={control}
            style={styles.actionButton}
            onPress={() => {
              navigate('Approver');
            }}
          >
            Continue
          </FormSubmitButton>
        )}
      </Actions>
    </Screen>
  );
};

const styles = StyleSheet.create({
  nameContainer: {
    margin: 16,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
});
