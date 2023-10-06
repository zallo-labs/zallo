import { SearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { gql } from '@api/generated';
import { useMutation } from 'urql';
import { useQuery } from '~/gql';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';

const Query = gql(/* GraphQL */ `
  query CreateUser {
    user {
      id
      name
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation CreateUserScreen_Update($name: String!) {
    updateUser(input: { name: $name }) {
      id
      name
    }
  }
`);

interface Inputs {
  name: string;
}

export type UserOnboardingScreenRoute = `/onboard/user`;
export type OnboardUserScreenParams = SearchParams<UserOnboardingScreenRoute>;

export default function UserOnboardingScreen() {
  const router = useRouter();
  const { user } = useQuery(Query).data;
  const update = useMutation(Update)[1];

  const { control, handleSubmit } = useForm<Inputs>({
    defaultValues: { name: user.name ?? '' },
  });

  return (
    <View style={styles.root}>
      <AppbarOptions mode="large" headline="User" />

      <FormTextField
        label="Name"
        supporting="Only visible by account members"
        name="name"
        placeholder="Alisha"
        autoFocus
        control={control}
        rules={{ required: true }}
        containerStyle={styles.nameContainer}
        onBlur={handleSubmit(async ({ name }) => {
          await update({ name });
        })}
      />

      <Actions>
        <FormSubmitButton
          mode="contained"
          control={control}
          style={styles.actionButton}
          onPress={() => router.push(`/onboard/approver`)}
        >
          Continue
        </FormSubmitButton>
      </Actions>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  nameContainer: {
    margin: 16,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
});
