import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { Appbar } from '~/components/Appbar/Appbar';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { Screen } from '~/components/layout/Screen';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { gql } from '@api/generated';
import { useMutation } from 'urql';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query CreateUser {
    user {
      id
      name
    }
  }
`);

const Upsert = gql(/* GraphQL */ `
  mutation CreateUserScreen_Upsert($name: String!) {
    updateUser(input: { name: $name }) {
      id
      name
    }
  }
`);

interface Inputs {
  name: string;
}

export type CreateUserScreenProps = StackNavigatorScreenProps<'CreateUser'>;

export const CreateUserScreen = ({ navigation: { navigate } }: CreateUserScreenProps) => {
  const { user } = useQuery(Query).data;
  const update = useMutation(Upsert)[1];

  const { control, handleSubmit } = useForm<Inputs>({
    defaultValues: { name: user.name ?? '' },
  });

  return (
    <Screen>
      <Appbar mode="large" leading="back" headline="User" />

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
          await update({ name });
        })}
      />

      <Actions>
        <FormSubmitButton
          mode="contained"
          control={control}
          style={styles.actionButton}
          onPress={() => {
            navigate('Approver', { isOnboarding: true });
          }}
        >
          Continue
        </FormSubmitButton>
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
